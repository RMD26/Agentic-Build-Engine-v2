import React from 'react';
import { CollapsiblePanel } from './CollapsiblePanel';

export interface TimelineEvent {
  id: string;
  actor: 'CONDUCTOR' | 'RUNNER' | 'REVIEWER' | 'SYSTEM';
  status: 'testing' | 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

const statusTone = {
  testing: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  success: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  warning: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
  error: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  info: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
} as const;

const actorTone = {
  CONDUCTOR: 'text-fuchsia-300 border-fuchsia-500/20 bg-fuchsia-500/10',
  RUNNER: 'text-amber-300 border-amber-500/20 bg-amber-500/10',
  REVIEWER: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10',
  SYSTEM: 'text-slate-300 border-slate-500/20 bg-slate-500/10'
} as const;

export const TimelinePanel: React.FC<{
  events: TimelineEvent[];
  expanded?: boolean;
  setExpanded?: (expanded: boolean) => void;
}> = ({ events, expanded, setExpanded }) => {
  return (
    <CollapsiblePanel
      title="Timeline"
      badgeText={String(events.length)}
      defaultExpanded={expanded ?? true}
      onToggle={setExpanded}
      contentClassName="p-0"
    >
      {events.length === 0 ? (
        <p className="px-4 py-3 text-xs text-slate-500 italic">No events yet.</p>
      ) : (
        <div className="divide-y divide-slate-800/50">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 px-4 py-3">
              <span
                className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${actorTone[event.actor]}`}
              >
                {event.actor}
              </span>
              <span
                className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusTone[event.status]}`}
              >
                {event.status}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-300">{event.message}</p>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">{event.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </CollapsiblePanel>
  );
};

export interface LogEntry {
  id: string;
  level: 'system' | 'info' | 'warn' | 'error';
  source: string;
  timestamp: string;
  message: string;
}

const logLevelTone = {
  system: 'text-cyan-300',
  info: 'text-slate-300',
  warn: 'text-amber-300',
  error: 'text-rose-300'
} as const;

export const LogPanel: React.FC<{
  title?: string;
  entries: LogEntry[];
  expanded?: boolean;
  setExpanded?: (expanded: boolean) => void;
}> = ({ title = 'Logs', entries, expanded, setExpanded }) => {
  return (
    <CollapsiblePanel
      title={title}
      badgeText={String(entries.length)}
      defaultExpanded={expanded ?? true}
      onToggle={setExpanded}
      contentClassName="p-0"
    >
      {entries.length === 0 ? (
        <p className="px-4 py-3 font-mono text-xs text-slate-500 italic">No log entries.</p>
      ) : (
        <div className="divide-y divide-slate-800/50 font-mono">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 px-4 py-2">
              <span
                className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider ${logLevelTone[entry.level]}`}
              >
                {entry.level}
              </span>
              <span className="shrink-0 text-[10px] text-slate-500">{entry.source}</span>
              <span className={`min-w-0 flex-1 break-all text-xs ${logLevelTone[entry.level]}`}>
                {entry.message}
              </span>
              <span className="shrink-0 text-[10px] text-slate-500">{entry.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </CollapsiblePanel>
  );
};

export interface ContextMessage {
  id: string;
  role: 'conductor' | 'coder' | 'reviewer' | 'runner';
  content: string;
}

const roleTone = {
  conductor: 'text-fuchsia-300',
  coder: 'text-cyan-300',
  reviewer: 'text-emerald-300',
  runner: 'text-amber-300'
} as const;

export const ContextSidebarPanel: React.FC<{
  items: ContextMessage[];
  expanded?: boolean;
  setExpanded?: (expanded: boolean) => void;
}> = ({ items, expanded, setExpanded }) => {
  return (
    <CollapsiblePanel
      title="Context"
      badgeText={String(items.length)}
      defaultExpanded={expanded ?? true}
      onToggle={setExpanded}
    >
      {items.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No context messages.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${roleTone[item.role]}`}
              >
                {item.role}
              </span>
              <p className="text-xs leading-relaxed text-slate-300">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </CollapsiblePanel>
  );
};
