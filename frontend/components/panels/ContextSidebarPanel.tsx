import React from 'react';
import {
  BrainCircuit,
  Code2,
  ShieldCheck,
  TerminalSquare,
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
} from 'lucide-react';
import type { TimelineEvent } from './panelTypes';

interface ContextSidebarPanelProps {
  activeEvent: TimelineEvent | null;
}

const getActorIcon = (actor: TimelineEvent['actor']) => {
  switch (actor) {
    case 'CONDUCTOR': return <BrainCircuit size={20} className="text-purple-400" />;
    case 'CODER':     return <Code2 size={20} className="text-blue-400" />;
    case 'REVIEWER':  return <ShieldCheck size={20} className="text-emerald-400" />;
    case 'RUNNER':    return <TerminalSquare size={20} className="text-amber-400" />;
    default:          return <Settings size={20} className="text-slate-400" />;
  }
};

const StatusBadge: React.FC<{ status: TimelineEvent['status'] }> = ({ status }) => {
  switch (status) {
    case 'success':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
          <CheckCircle2 size={10} /> success
        </span>
      );
    case 'failure':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle size={10} /> failure
        </span>
      );
    case 'testing':
    case 'running':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Loader2 size={10} className="animate-spin" /> {status}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20">
          {status}
        </span>
      );
  }
};

export const ContextSidebarPanel: React.FC<ContextSidebarPanelProps> = ({ activeEvent }) => {
  return (
    <div className="w-64 shrink-0 flex flex-col border-l border-slate-800/80 bg-slate-950/60">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 shrink-0">
        <Info size={13} className="text-slate-500" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Event Context</span>
      </div>

      {activeEvent === null ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-slate-700 italic text-center">Select an event to view details.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-slate-800 bg-slate-900/80 flex items-center justify-center shrink-0">
              {getActorIcon(activeEvent.actor)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200">{activeEvent.actor}</p>
              <p className="text-[10px] font-mono text-slate-500">{activeEvent.timestamp}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-600">Status</span>
              <StatusBadge status={activeEvent.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-600">Step</span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                {activeEvent.step}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-600">ID</span>
              <span className="text-[10px] font-mono text-slate-600">{activeEvent.id}</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Message</p>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-800/60">
              {activeEvent.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
