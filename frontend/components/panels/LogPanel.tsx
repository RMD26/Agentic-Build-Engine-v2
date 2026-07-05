import React, { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import type { TimelineEvent } from './panelTypes';

interface LogPanelProps {
  events: TimelineEvent[];
}

const getActorColor = (actor: TimelineEvent['actor']): string => {
  switch (actor) {
    case 'CONDUCTOR': return 'text-purple-400';
    case 'CODER':     return 'text-blue-400';
    case 'REVIEWER':  return 'text-emerald-400';
    case 'RUNNER':    return 'text-amber-400';
    default:          return 'text-slate-400';
  }
};

const getMessageColor = (status: TimelineEvent['status']): string => {
  switch (status) {
    case 'success': return 'text-green-400';
    case 'failure': return 'text-red-400';
    default:        return 'text-slate-400';
  }
};

export const LogPanel: React.FC<LogPanelProps> = ({ events }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-950/80">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 shrink-0">
        <Terminal size={13} className="text-slate-500" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Output Log</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto font-mono text-[11px] p-4 space-y-1 leading-relaxed">
        {events.length === 0 ? (
          <span className="text-slate-700 italic">Awaiting output...</span>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex gap-2">
              <span className="text-slate-700 shrink-0">{event.timestamp}</span>
              <span className={`shrink-0 ${getActorColor(event.actor)}`}>[{event.actor}]</span>
              <span className={getMessageColor(event.status)}>{event.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
