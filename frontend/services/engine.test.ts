import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConductorEngine } from './engine';
import { CoderAgent, ReviewerAgent } from './agents';
import { SynapseConfig, WebviewMessage } from '../types';

const config: SynapseConfig = {
  maxIterations: 5,
  strictSecurityMode: true,
  autoFixEnabled: false,
  executionEnvironment: 'sandboxed-container',
  // 'custom' keeps CoderAgent on its offline simulation path (no network).
  llmProvider: 'custom',
  allowedDependencies: ['react'],
};

interface Harness {
  messages: WebviewMessage[];
  approvals: Array<{ operation: string; resume: () => Promise<void> }>;
  engine: ConductorEngine;
}

function makeEngine(prompt = 'fix the auth bug'): Harness {
  const messages: WebviewMessage[] = [];
  const approvals: Harness['approvals'] = [];
  const engine = new ConductorEngine(
    prompt,
    '/workspace',
    config,
    (msg) => messages.push(msg),
    (operation, resume) => approvals.push({ operation, resume })
  );
  return { messages, approvals, engine };
}

const lastState = (messages: WebviewMessage[]) => messages.at(-1)!.payload.state;

describe('ConductorEngine', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('drives a clean run up to the human approval interrupt', async () => {
    const { messages, approvals, engine } = makeEngine();

    await engine.executeWorkflow();

    // Pauses for human approval rather than completing autonomously.
    expect(approvals).toHaveLength(1);
    expect(approvals[0].operation).toContain('Apply file changes');
    expect(lastState(messages).currentPhase).toBe('INTERRUPTED');
    expect(lastState(messages).securityReport?.isValid).toBe(true);
    expect(lastState(messages).proposedMutations.length).toBeGreaterThan(0);
  });

  it('emits timeline events for each transition with matching actor/status', async () => {
    const { messages, engine } = makeEngine();
    await engine.executeWorkflow();

    const logs = messages.map((m) => m.payload.log).filter(Boolean);
    expect(logs.length).toBeGreaterThan(0);

    const actors = logs.map((l) => l!.actor);
    expect(actors).toContain('CONDUCTOR');
    expect(actors).toContain('CODER');
    expect(actors).toContain('REVIEWER');

    // Every timeline event carries a non-empty id and ISO timestamp.
    for (const log of logs) {
      expect(log!.id).toBeTruthy();
      expect(() => new Date(log!.timestamp).toISOString()).not.toThrow();
    }
  });

  it('completes with SUCCESS after the human approves', async () => {
    vi.useFakeTimers();
    const { messages, approvals, engine } = makeEngine();

    await engine.executeWorkflow();
    const resumePromise = approvals[0].resume();
    await vi.runAllTimersAsync();
    await resumePromise;

    const state = lastState(messages);
    expect(state.currentPhase).toBe('SUCCESS');
    expect(state.executionResult).toEqual({
      exitCode: 0,
      stdout: expect.stringContaining('PASS'),
      stderr: '',
    });
  });

  it('halts with FAILURE when the security audit rejects the changes', async () => {
    vi.spyOn(ReviewerAgent.prototype, 'auditChanges').mockResolvedValue({
      isValid: false,
      detectedVulnerabilities: ['execution construct found in evil.ts'],
      untrustedDependencies: ['malicious-pkg'],
    });

    const { messages, approvals, engine } = makeEngine();
    await engine.executeWorkflow();

    expect(approvals).toHaveLength(0);
    const state = lastState(messages);
    expect(state.currentPhase).toBe('FAILURE');
    expect(state.errorMessage).toContain('malicious-pkg');
    expect(state.errorMessage).toContain('evil.ts');
  });

  it('captures exceptions thrown mid-workflow as a FAILURE state', async () => {
    vi.spyOn(CoderAgent.prototype, 'generateFix').mockRejectedValue(new Error('boom'));

    const { messages, engine } = makeEngine();
    await engine.executeWorkflow();

    const state = lastState(messages);
    expect(state.currentPhase).toBe('FAILURE');
    expect(state.errorMessage).toBe('boom');
  });

  it('uses a fallback message when a thrown error has no message', async () => {
    vi.spyOn(CoderAgent.prototype, 'generateFix').mockRejectedValue({});

    const { messages, engine } = makeEngine();
    await engine.executeWorkflow();

    expect(lastState(messages).errorMessage).toBe('Unknown orchestration execution failure.');
  });

  it('initializes state from the constructor arguments', async () => {
    const { messages, engine } = makeEngine('build me a feature');
    await engine.executeWorkflow();

    const state = lastState(messages);
    expect(state.userPrompt).toBe('build me a feature');
    expect(state.taskId).toMatch(/^task_\d+$/);
  });
});
