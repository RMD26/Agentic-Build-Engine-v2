import { beforeEach, describe, expect, it } from 'vitest';
import { useEngineStore } from './store';
import { DEFAULT_CONFIG } from './constants';

const initialState = useEngineStore.getState();

beforeEach(() => {
  // Restore the pristine store (including action references) before each test.
  useEngineStore.setState(initialState, true);
});

describe('useEngineStore', () => {
  it('starts with sensible defaults', () => {
    const s = useEngineStore.getState();
    expect(s.isRunning).toBe(false);
    expect(s.activePhase).toBeNull();
    expect(s.completedPhases).toEqual([]);
    expect(s.config).toBe(DEFAULT_CONFIG);
    expect(s.conductorState).toBeNull();
    expect(s.pendingApproval).toBeNull();
    expect(s.healingState).toEqual({ isHealing: false, attempt: 0, maxAttempts: 3 });
  });

  it('starts and stops the engine', () => {
    useEngineStore.getState().startEngine();
    expect(useEngineStore.getState().isRunning).toBe(true);
    useEngineStore.getState().stopEngine();
    expect(useEngineStore.getState().isRunning).toBe(false);
  });

  it('sets the active phase', () => {
    useEngineStore.getState().setActivePhase('F');
    expect(useEngineStore.getState().activePhase).toBe('F');
    useEngineStore.getState().setActivePhase(null);
    expect(useEngineStore.getState().activePhase).toBeNull();
  });

  it('marks phases complete without duplicates', () => {
    const { markPhaseComplete } = useEngineStore.getState();
    markPhaseComplete('A');
    markPhaseComplete('B');
    markPhaseComplete('A');
    expect(useEngineStore.getState().completedPhases).toEqual(['A', 'B']);
  });

  it('appends logs with defaults and generated ids', () => {
    const before = useEngineStore.getState().logs.length;
    useEngineStore.getState().addLog('CODER', 'wrote a file');
    const logs = useEngineStore.getState().logs;
    expect(logs.length).toBe(before + 1);
    const entry = logs.at(-1)!;
    expect(entry.phase).toBe('CODER');
    expect(entry.message).toBe('wrote a file');
    expect(entry.type).toBe('info');
    expect(entry.source).toBe('orchestrator');
    expect(entry.id).toBeTruthy();
  });

  it('honors explicit log type and source', () => {
    useEngineStore.getState().addLog('SYSTEM', 'boom', 'error', 'runner-sandbox');
    const entry = useEngineStore.getState().logs.at(-1)!;
    expect(entry.type).toBe('error');
    expect(entry.source).toBe('runner-sandbox');
  });

  it('merges partial config updates', () => {
    useEngineStore.getState().setConfig({ name: 'renamed-app' });
    const config = useEngineStore.getState().config;
    expect(config.name).toBe('renamed-app');
    // Untouched fields are preserved.
    expect(config.framework).toBe(DEFAULT_CONFIG.framework);
  });

  it('toggles the config modal', () => {
    useEngineStore.getState().setConfigModalOpen(true);
    expect(useEngineStore.getState().isConfigModalOpen).toBe(true);
  });

  it('clears logs', () => {
    useEngineStore.getState().clearLogs();
    expect(useEngineStore.getState().logs).toEqual([]);
  });

  it('resets the engine to a fresh sequence', () => {
    const store = useEngineStore.getState();
    store.startEngine();
    store.setActivePhase('C');
    store.markPhaseComplete('A');
    store.setConductorState({
      taskId: 't',
      currentPhase: 'CODING',
      userPrompt: 'x',
      proposedMutations: [],
      securityReport: null,
      executionResult: null,
    });

    store.resetEngine();

    const s = useEngineStore.getState();
    expect(s.isRunning).toBe(false);
    expect(s.activePhase).toBeNull();
    expect(s.completedPhases).toEqual([]);
    expect(s.conductorState).toBeNull();
    expect(s.pendingApproval).toBeNull();
    expect(s.logs).toHaveLength(1);
    expect(s.logs[0].message).toContain('Engine reset');
  });

  it('merges partial healing-state updates', () => {
    useEngineStore.getState().setHealingState({ isHealing: true, attempt: 2 });
    const hs = useEngineStore.getState().healingState;
    expect(hs).toEqual({ isHealing: true, attempt: 2, maxAttempts: 3 });
  });

  it('adds a new ghost task when the id is unseen', () => {
    const before = useEngineStore.getState().ghostTasks.length;
    useEngineStore.getState().updateGhostTask({ id: 'g2', task: 'Lint', status: 'scanning' });
    const tasks = useEngineStore.getState().ghostTasks;
    expect(tasks.length).toBe(before + 1);
    expect(tasks.find((t) => t.id === 'g2')?.status).toBe('scanning');
  });

  it('updates an existing ghost task in place', () => {
    useEngineStore.getState().updateGhostTask({ id: 'g1', task: 'Vulnerability Scan', status: 'analyzing' });
    const tasks = useEngineStore.getState().ghostTasks;
    expect(tasks.filter((t) => t.id === 'g1')).toHaveLength(1);
    expect(tasks.find((t) => t.id === 'g1')?.status).toBe('analyzing');
  });

  it('adds chat messages with generated id and timestamp', () => {
    const before = useEngineStore.getState().chatMessages.length;
    useEngineStore.getState().addChatMessage({ role: 'user', content: 'hello' });
    const msgs = useEngineStore.getState().chatMessages;
    expect(msgs.length).toBe(before + 1);
    const msg = msgs.at(-1)!;
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('hello');
    expect(msg.id).toBeTruthy();
    expect(typeof msg.timestamp).toBe('number');
  });

  it('sets conductor state and pending approval', () => {
    const resume = async () => {};
    useEngineStore.getState().setPendingApproval({ operation: 'apply', resumeToken: resume });
    expect(useEngineStore.getState().pendingApproval?.operation).toBe('apply');
    useEngineStore.getState().setPendingApproval(null);
    expect(useEngineStore.getState().pendingApproval).toBeNull();
  });
});
