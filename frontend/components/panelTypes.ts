export type TimelineStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failure'
  | 'warning'
  | 'skipped';

export type TimelineActor =
  | 'CONDUCTOR'
  | 'CODER'
  | 'REVIEWER'
  | 'RUNNER'
  | 'SYSTEM';

export interface TimelineEvent {
  id: string;
  actor: TimelineActor;
  status: TimelineStatus;
  title: string;
  detail?: string;
  timestamp: number;
}
