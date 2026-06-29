import React, { useRef, useEffect } from 'react';
import {
  BrainCircuit,
  Code2,
  ShieldCheck,
  TerminalSquare,
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { TimelineEvent } from './panelTypes';

interface TimelinePanelVirtualizedProps {
  events: TimelineEvent[];
  expanded: boolean;
  onToggleExpand: () => void;
  activeEventId: string | null;
  onEventSelect: (id: string) => void;
}

const getActorIcon = (actor: TimelineEvent['actor']) => {
  switch (actor) {
    case 'CONDUCTOR': return <BrainCircuit size={14} className="text-purple-400" />;
    case 'CODER':     return <Code2 size={14} className="text-blue-400" />;
    case 'REVIEWER':  return <ShieldCheck size={14} className="text-emerald-400" />;
    case 'RUNNER':    return <TerminalSquare size={14} className="text-amber-400" />;
    default:          return <Settings size={14} className="text-slate-400" />;
  }
};

const getStatusIcon = (status: TimelineEvent['status']) => {
  switch (status) {
    case 'success': return <CheckCircle2 size={14} className="text-green-400" />;
    case 'failure': return <XCircle size={14} className="text-red-400" />;
    case 'testing':
    case 'running': return <Loader2 size={14} className="text-cyan-400 animate-spin" />;
    default:        return <div className="w-2 h-2 rounded-full bg-slate-600" />;
  }
};

const getRowBorderClass = (status: TimelineEvent['status']) => {
  switch (status) {
    case 'success': return 'border-green-500/30 bg-green-500/5';
    case 'failure': return 'border-red-500/30 bg-red-500/5';
    case 'testing':
    case 'running': return 'border-cyan-500/30 bg-cyan-500/5';
    default:        return 'border-slate-700/50 bg-slate-900/30';
  }
};

export const TimelinePanelVirtualized: React.FC<TimelinePanelVirtualizedProps> = ({
  events,
  expanded,
  onToggleExpand,
  activeEventId,
  onEventSelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && expanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, expanded]);

  return (
    <div className="flex flex-col border-b border-slate-800/80 bg-slate-950/60 shrink-0">
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-slate-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Timeline</span>
          <span className="text-[10px] font-mono bg-slate-800/80 text-slate-500 px-1.5 py-0.5 rounded">
            {events.length} events
          </span>
        </div>
        {expanded
          ? <ChevronUp size={14} className="text-slate-500" />
          : <ChevronDown size={14} className="text-slate-500" />}
      </button>

      {expanded && (
        <div ref={scrollRef} className="max-h-72 overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {events.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-2">No events recorded.</p>
            ) : (
              events.map((event) => {
                const isActive = event.id === activeEventId;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onEventSelect(event.id)}
                    className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                      isActive
                        ? 'border-cyan-500/40 bg-cyan-500/10 ring-1 ring-cyan-500/20'
                        : `${getRowBorderClass(event.status)} hover:border-slate-600/50`
                    }`}
                  >
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      {getActorIcon(event.actor)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
                          {event.actor}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">{event.timestamp}</span>
                        <span className="ml-auto text-[10px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                          {event.step}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed truncate">{event.message}</p>
                    </div>
                    <div className="shrink-0 pt-0.5">{getStatusIcon(event.status)}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
