import React from 'react';
import { Activity, Cpu, ShieldAlert, RefreshCw, Eye } from 'lucide-react';
import { useEngineStore } from '../store';

export const Header: React.FC = () => {
  const { isRunning, healingState, ghostTasks } = useEngineStore();
  
  const activeGhostTask = ghostTasks.find(t => t.status !== 'idle');

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 shrink-0 z-10 relative">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-md border ${isRunning ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-muted border-border text-muted-foreground'}`}>
          <Cpu size={20} className={isRunning ? 'animate-pulse' : ''} />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wider text-foreground uppercase">Agentic Build Engine</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Closed-Loop State Machine</p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs font-mono">
        {/* Ghost Agent Status */}
        {activeGhostTask && (
          <div className="flex items-center gap-2 text-purple-400 bg-purple-400/10 px-2 py-1 rounded-md border border-purple-400/20">
            <Eye size={14} className="animate-pulse" />
            <span>GHOST: {activeGhostTask.task} {activeGhostTask.file && `(${activeGhostTask.file})`}</span>
          </div>
        )}

        {/* Healing Status */}
        {healingState.isHealing && (
          <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
            <RefreshCw size={14} className="animate-spin" />
            <span>HEALING ({healingState.attempt}/{healingState.maxAttempts})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">STATUS:</span>
          {isRunning ? (
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Activity size={14} className="animate-pulse" />
              EXECUTING
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldAlert size={14} />
              IDLE
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
