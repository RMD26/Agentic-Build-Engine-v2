export interface TimelineEvent {
  id: string;
  actor: 'CONDUCTOR' | 'RUNNER' | 'CODER' | 'REVIEWER' | 'SYSTEM';
  status: 'testing' | 'running' | 'success' | 'failure' | 'pending';
  timestamp: string;
  step: string;
  message: string;
}
