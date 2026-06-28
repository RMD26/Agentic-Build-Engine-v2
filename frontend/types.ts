export type PhaseId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N';

export interface Persona {
  id: PhaseId;
  name: string;
  role: string;
  description: string;
}

export type LogType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type LogSource = 'orchestrator' | 'extension-host' | 'webview' | 'runner-sandbox';

export interface LogEntry {
  id: string;
  timestamp: number;
  phase: string; // Can be PhaseId or AgentRole
  message: string;
  type: LogType;
  source: LogSource;
}

export interface SynapseConfig {
  maxIterations: number;
  strictSecurityMode: boolean;
  autoFixEnabled: boolean;
  executionEnvironment: 'local-terminal' | 'sandboxed-container';
  llmProvider: 'vertex-ai' | 'custom';
  allowedDependencies: string[];
}

export interface ProjectConfig {
  name: string;
  framework: string;
  ui: string;
  database: string;
  auth: string;
  enableGraphRAG: boolean;
  enableGhostAgents: boolean;
  synapseConfig: SynapseConfig;
}

export interface HealingState {
  isHealing: boolean;
  attempt: number;
  maxAttempts: number;
  targetFile?: string;
}

export interface GhostTask {
  id: string;
  task: string;
  status: 'scanning' | 'analyzing' | 'idle';
  file?: string;
}

export interface DiffFile {
  filename: string;
  status: 'modified' | 'added' | 'deleted';
  additions: number;
  deletions: number;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  type?: 'message' | 'thought';
  content: string;
  timestamp: number;
  image?: string;
  diffs?: DiffFile[];
}

// --- Agent System Types ---

export type AgentRole = 'CONDUCTOR' | 'CODER' | 'REVIEWER' | 'RUNNER' | 'SYSTEM';

export interface AgentContext {
  workspacePath: string;
  config: SynapseConfig;
  history: StateLog[];
}

export interface SystemState {
  taskId: string;
  currentPhase: 'ANALYSIS' | 'CODING' | 'REVIEW' | 'INTERRUPTED' | 'TESTING' | 'SUCCESS' | 'FAILURE';
  userPrompt: string;
  proposedMutations: WorkspaceMutation[];
  securityReport: SecurityReport | null;
  executionResult: ExecutionResult | null;
  errorMessage?: string;
}

export interface WorkspaceMutation {
  type: 'CREATE_FILE' | 'UPDATE_FILE' | 'DELETE_FILE';
  filePath: string;
  content: string;
}

export interface SecurityReport {
  isValid: boolean;
  detectedVulnerabilities: string[];
  untrustedDependencies: string[];
}

export interface ExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface StateLog {
  timestamp: number;
  agent: AgentRole;
  message: string;
  phase: SystemState['currentPhase'];
}

export interface WebviewMessage {
  type: 'AGENT_STATE_UPDATE';
  payload: {
    state: SystemState;
    log?: StateLog;
  };
}
