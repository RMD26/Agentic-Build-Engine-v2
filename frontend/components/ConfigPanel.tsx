import React from 'react';
import { Settings, Play, Square, RotateCcw, Database, Ghost, FileJson } from 'lucide-react';
import { useEngineStore } from '../store';

export const ConfigPanel: React.FC = () => {
  const { config, setConfig, isRunning, startEngine, stopEngine, resetEngine, addLog, setConfigModalOpen } = useEngineStore();

  const handleStart = () => {
    if (isRunning) return;
    resetEngine();
    addLog('SYSTEM', `Initializing build sequence for project: ${config.name}`, 'system', 'extension-host');
    if (config.enableGraphRAG) addLog('SYSTEM', 'GraphRAG Semantic Memory enabled.', 'info', 'orchestrator');
    if (config.enableGhostAgents) addLog('SYSTEM', 'Asynchronous Ghost Agents enabled.', 'info', 'orchestrator');
    startEngine();
  };

  const handleStop = () => {
    if (!isRunning) return;
    addLog('SYSTEM', 'HALT SIGNAL RECEIVED. Aborting sequence.', 'warning', 'extension-host');
    stopEngine();
  };

  return (
    <div className="w-72 border-r border-border bg-card flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-border flex items-center justify-between text-sm font-semibold text-foreground uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-muted-foreground" />
          Parameters
        </div>
        <button 
          onClick={() => setConfigModalOpen(true)}
          className="text-cyan-500 hover:text-cyan-400 transition-colors p-1 rounded hover:bg-cyan-500/10"
          title="Edit synapseai.json"
        >
          <FileJson size={16} />
        </button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Project Name</label>
          <input 
            type="text" 
            value={config.name}
            onChange={(e) => setConfig({ name: e.target.value })}
            disabled={isRunning}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Framework</label>
          <select 
            value={config.framework}
            onChange={(e) => setConfig({ framework: e.target.value })}
            disabled={isRunning}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50 appearance-none"
          >
            <option>Next.js 14+ (App Router)</option>
            <option>Vite + React</option>
            <option>SvelteKit</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">UI Layer</label>
          <select 
            value={config.ui}
            onChange={(e) => setConfig({ ui: e.target.value })}
            disabled={isRunning}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50 appearance-none"
          >
            <option>Tailwind CSS + shadcn/ui</option>
            <option>MUI</option>
            <option>Chakra UI</option>
          </select>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={config.enableGraphRAG}
              onChange={(e) => setConfig({ enableGraphRAG: e.target.checked })}
              disabled={isRunning}
              className="rounded border-input bg-background text-cyan-500 focus:ring-cyan-500/50"
            />
            <Database size={14} className="text-muted-foreground" />
            <span className="text-sm text-foreground">GraphRAG Memory</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={config.enableGhostAgents}
              onChange={(e) => setConfig({ enableGhostAgents: e.target.checked })}
              disabled={isRunning}
              className="rounded border-input bg-background text-cyan-500 focus:ring-cyan-500/50"
            />
            <Ghost size={14} className="text-muted-foreground" />
            <span className="text-sm text-foreground">Ghost Agents</span>
          </label>
        </div>
      </div>

      <div className="p-4 border-t border-border space-y-3 bg-muted/30">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-muted disabled:text-muted-foreground text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
        >
          <Play size={16} />
          ENGAGE ENGINE
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleStop}
            disabled={!isRunning}
            className="flex-1 flex items-center justify-center gap-2 bg-destructive/20 hover:bg-destructive/40 text-destructive-foreground disabled:opacity-30 border border-destructive/50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Square size={14} />
            HALT
          </button>
          <button
            onClick={resetEngine}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:opacity-30 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <RotateCcw size={14} />
            RESET
          </button>
        </div>
      </div>
    </div>
  );
};
