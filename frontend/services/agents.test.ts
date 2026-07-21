import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoderAgent, ReviewerAgent, RunnerAgent } from './agents';
import * as synapse from './synapse';
import { AgentContext, SynapseConfig, SystemState, WorkspaceMutation } from '../types';

function makeConfig(overrides: Partial<SynapseConfig> = {}): SynapseConfig {
  return {
    maxIterations: 5,
    strictSecurityMode: true,
    autoFixEnabled: false,
    executionEnvironment: 'sandboxed-container',
    llmProvider: 'vertex-ai',
    allowedDependencies: ['react', 'zod'],
    ...overrides,
  };
}

function makeContext(config: SynapseConfig): AgentContext {
  return { workspacePath: '/workspace', config, history: [] };
}

const state: SystemState = {
  taskId: 'task_1',
  currentPhase: 'CODING',
  userPrompt: 'add a validator',
  proposedMutations: [],
  securityReport: null,
  executionResult: null,
};

describe('CoderAgent', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns the simulation fallback when provider is custom', async () => {
    const agent = new CoderAgent();
    const mutations = await agent.generateFix(makeContext(makeConfig({ llmProvider: 'custom' })), state);

    expect(mutations).toHaveLength(1);
    expect(mutations[0].type).toBe('CREATE_FILE');
    expect(mutations[0].filePath).toBe('src/services/secureAuth.ts');
    expect(mutations[0].content).toContain('validateToken');
  });

  it('uses SynapseAI-generated mutations when provider is vertex-ai', async () => {
    const generated: WorkspaceMutation[] = [
      { type: 'CREATE_FILE', filePath: 'src/a.ts', content: 'export const a = 1;' },
    ];
    const generateSpy = vi
      .spyOn(synapse.SynapseAI.prototype, 'generate')
      .mockResolvedValue(JSON.stringify(generated));

    const agent = new CoderAgent();
    const mutations = await agent.generateFix(makeContext(makeConfig()), state);

    expect(generateSpy).toHaveBeenCalledOnce();
    expect(mutations).toEqual(generated);
  });

  it('falls back to simulation when extraction yields an empty array', async () => {
    vi.spyOn(synapse.SynapseAI.prototype, 'generate').mockResolvedValue('[]');

    const agent = new CoderAgent();
    const mutations = await agent.generateFix(makeContext(makeConfig()), state);

    expect(mutations[0].filePath).toBe('src/services/secureAuth.ts');
  });

  it('falls back to simulation when SynapseAI throws', async () => {
    vi.spyOn(synapse.SynapseAI.prototype, 'generate').mockRejectedValue(new Error('network'));

    const agent = new CoderAgent();
    const mutations = await agent.generateFix(makeContext(makeConfig()), state);

    expect(mutations[0].filePath).toBe('src/services/secureAuth.ts');
  });

  it('falls back to simulation when the model output has no JSON array', async () => {
    vi.spyOn(synapse.SynapseAI.prototype, 'generate').mockResolvedValue('no json here');

    const agent = new CoderAgent();
    const mutations = await agent.generateFix(makeContext(makeConfig()), state);

    expect(mutations[0].filePath).toBe('src/services/secureAuth.ts');
  });
});

describe('ReviewerAgent', () => {
  const reviewer = new ReviewerAgent();

  it('passes clean mutations that only use allowed dependencies', async () => {
    const mutations: WorkspaceMutation[] = [
      { type: 'CREATE_FILE', filePath: 'a.ts', content: "import x from 'react';\nimport y from './local';" },
    ];
    const report = await reviewer.auditChanges(makeContext(makeConfig()), mutations);

    expect(report.isValid).toBe(true);
    expect(report.detectedVulnerabilities).toEqual([]);
    expect(report.untrustedDependencies).toEqual([]);
  });

  it('flags dependencies that are not in the allow-list', async () => {
    const mutations: WorkspaceMutation[] = [
      { type: 'CREATE_FILE', filePath: 'a.ts', content: "import axios from 'axios';" },
    ];
    const report = await reviewer.auditChanges(makeContext(makeConfig()), mutations);

    expect(report.isValid).toBe(false);
    expect(report.untrustedDependencies).toContain('axios');
  });

  it('ignores relative and src/ imports when checking dependencies', async () => {
    const mutations: WorkspaceMutation[] = [
      { type: 'CREATE_FILE', filePath: 'a.ts', content: "import a from './x';\nimport b from 'src/utils/y';" },
    ];
    const report = await reviewer.auditChanges(makeContext(makeConfig()), mutations);

    expect(report.isValid).toBe(true);
    expect(report.untrustedDependencies).toEqual([]);
  });

  it('detects eval() as a critical vulnerability', async () => {
    const mutations: WorkspaceMutation[] = [
      { type: 'CREATE_FILE', filePath: 'danger.ts', content: 'const r = eval("2+2");' },
    ];
    const report = await reviewer.auditChanges(makeContext(makeConfig()), mutations);

    expect(report.isValid).toBe(false);
    expect(report.detectedVulnerabilities[0]).toContain('danger.ts');
  });

  it('detects exec() as a critical vulnerability', async () => {
    const mutations: WorkspaceMutation[] = [
      { type: 'CREATE_FILE', filePath: 'danger.ts', content: 'child.exec("rm -rf /");' },
    ];
    const report = await reviewer.auditChanges(makeContext(makeConfig()), mutations);

    expect(report.isValid).toBe(false);
    expect(report.detectedVulnerabilities).toHaveLength(1);
  });

  it('accumulates issues across multiple mutations', async () => {
    const mutations: WorkspaceMutation[] = [
      { type: 'CREATE_FILE', filePath: 'a.ts', content: "import lodash from 'lodash';" },
      { type: 'UPDATE_FILE', filePath: 'b.ts', content: 'eval("x");' },
    ];
    const report = await reviewer.auditChanges(makeContext(makeConfig()), mutations);

    expect(report.untrustedDependencies).toContain('lodash');
    expect(report.detectedVulnerabilities).toHaveLength(1);
    expect(report.isValid).toBe(false);
  });

  it('returns a valid report for an empty mutation set', async () => {
    const report = await reviewer.auditChanges(makeContext(makeConfig()), []);
    expect(report.isValid).toBe(true);
  });
});

describe('RunnerAgent', () => {
  it('produces a fixed, injection-safe npm test command', async () => {
    const runner = new RunnerAgent();
    const plan = await runner.prepareTestExecution(makeContext(makeConfig()), state);

    expect(plan.command).toBe('npm');
    expect(plan.args).toEqual(['run', 'test', '--', '--runTestsByPath', 'src/services/secureAuth.ts']);
  });
});
