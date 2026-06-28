import { create } from 'zustand';
import { PhaseId, LogEntry, ProjectConfig, LogType, HealingState, GhostTask, ChatMessage, LogSource, SystemState } from './types';
import { DEFAULT_CONFIG } from './constants';

interface EngineState {
  isRunning: boolean;
  activePhase: PhaseId | null;
  completedPhases: PhaseId[];
  logs: LogEntry[];
  config: ProjectConfig;
  isConfigModalOpen: boolean;
  
  healingState: HealingState;
  ghostTasks: GhostTask[];
  chatMessages: ChatMessage[];
  
  conductorState: SystemState | null;
  pendingApproval: { operation: string; resumeToken: () => Promise<void> } | null;
  
  // Actions
  startEngine: () => void;
  stopEngine: () => void;
  setActivePhase: (phase: PhaseId | null) => void;
  markPhaseComplete: (phase: PhaseId) => void;
  addLog: (phase: string, message: string, type?: LogType, source?: LogSource) => void;
  setConfig: (config: Partial<ProjectConfig>) => void;
  setConfigModalOpen: (isOpen: boolean) => void;
  clearLogs: () => void;
  resetEngine: () => void;
  
  setHealingState: (state: Partial<HealingState>) => void;
  updateGhostTask: (task: GhostTask) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  
  setConductorState: (state: SystemState | null) => void;
  setPendingApproval: (approval: { operation: string; resumeToken: () => Promise<void> } | null) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useEngineStore = create<EngineState>((set) => ({
  isRunning: false,
  activePhase: null,
  completedPhases: [],
  logs: [
    {
      id: generateId(),
      timestamp: Date.now(),
      phase: 'SYSTEM',
      message: 'SynapseAI Multi-Agent Framework initialized. Secure Webview connected.',
      type: 'system',
      source: 'extension-host'
    }
  ],
  config: DEFAULT_CONFIG,
  isConfigModalOpen: false,
  
  healingState: { isHealing: false, attempt: 0, maxAttempts: 3 },
  ghostTasks: [
    { id: 'g1', task: 'Vulnerability Scan', status: 'idle' }
  ],
  chatMessages: [
    {
      id: generateId(),
      role: 'system',
      content: 'Multi-Modal Context Engine online. Drag & drop screenshots or describe your intent.',
      timestamp: Date.now()
    }
  ],
  
  conductorState: null,
  pendingApproval: null,

  startEngine: () => set({ isRunning: true }),
  stopEngine: () => set({ isRunning: false }),
  setActivePhase: (phase) => set({ activePhase: phase }),
  markPhaseComplete: (phase) => set((state) => ({ 
    completedPhases: [...new Set([...state.completedPhases, phase])] 
  })),
  
  addLog: (phase, message, type = 'info', source = 'orchestrator') => set((state) => ({
    logs: [...state.logs, {
      id: generateId(),
      timestamp: Date.now(),
      phase,
      message,
      type,
      source
    }]
  })),

  setConfig: (newConfig) => set((state) => ({
    config: { ...state.config, ...newConfig }
  })),
  
  setConfigModalOpen: (isOpen) => set({ isConfigModalOpen: isOpen }),

  clearLogs: () => set({ logs: [] }),
  
  resetEngine: () => set({
    isRunning: false,
    activePhase: null,
    completedPhases: [],
    healingState: { isHealing: false, attempt: 0, maxAttempts: 3 },
    conductorState: null,
    pendingApproval: null,
    logs: [{
      id: generateId(),
      timestamp: Date.now(),
      phase: 'SYSTEM',
      message: 'Engine reset. Ready for new sequence.',
      type: 'system',
      source: 'orchestrator'
    }]
  }),

  setHealingState: (newState) => set((state) => ({
    healingState: { ...state.healingState, ...newState }
  })),

  updateGhostTask: (task) => set((state) => {
    const exists = state.ghostTasks.find(t => t.id === task.id);
    if (exists) {
      return { ghostTasks: state.ghostTasks.map(t => t.id === task.id ? task : t) };
    }
    return { ghostTasks: [...state.ghostTasks, task] };
  }),

  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, {
      ...message,
      id: generateId(),
      timestamp: Date.now()
    }]
  })),
  
  setConductorState: (state) => set({ conductorState: state }),
  setPendingApproval: (approval) => set({ pendingApproval: approval })
}));
