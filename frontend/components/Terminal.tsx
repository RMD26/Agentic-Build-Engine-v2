import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Trash2, Server, Box, LayoutPanelLeft } from 'lucide-react';
import { useEngineStore } from '../store';
import { LogEntry, LogSource } from '../types';

const LogLine: React.FC<{ log: LogEntry }> = ({ log }) => {
  const time = new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1);
  
  let colorClass = 'text-muted-foreground';
  let prefix = '>';
  
  switch (log.type) {
    case 'info': colorClass = 'text-blue-400'; prefix = 'i'; break;
    case 'success': colorClass = 'text-emerald-400'; prefix = '✓'; break;
    case 'warning': colorClass = 'text-amber-400'; prefix = '⚠'; break;
    case 'error': colorClass = 'text-red-400'; prefix = '✖'; break;
    case 'system': colorClass = 'text-purple-400'; prefix = '⚙'; break;
  }

  return (
    <div className="flex items-start gap-3 hover:bg-muted/50 px-2 py-0.5 rounded-sm transition-colors">
      <span className="text-muted-foreground/50 shrink-0 select-none">[{time}]</span>
      <span className={`shrink-0 font-bold w-8 text-center ${colorClass}`}>{log.phase}</span>
      <span className={`shrink-0 select-none ${colorClass}`}>{prefix}</span>
      <span className={`break-all ${log.type === 'error' ? 'text-red-300' : 'text-foreground/90'}`}>
        {log.message}
      </span>
    </div>
  );
};

export const Terminal: React.FC = () => {
  const { logs, clearLogs } = useEngineStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<LogSource | 'all'>('all');

  const filteredLogs = activeTab === 'all' ? logs : logs.filter(l => l.source === activeTab);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs]);

  const tabs = [
    { id: 'all', label: 'All Logs', icon: TerminalIcon },
    { id: 'orchestrator', label: 'MAS Orchestrator', icon: Server },
    { id: 'extension-host', label: 'Extension Host', icon: LayoutPanelLeft },
    { id: 'runner-sandbox', label: 'Runner Sandbox', icon: Box },
  ] as const;

  return (
    <div className="h-64 border-t border-border bg-[#050505] flex flex-col shrink-0 font-mono text-[11px] sm:text-xs">
      <div className="flex items-center justify-between px-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-sans font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
        <button 
          onClick={clearLogs}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted mr-2"
          title="Clear Logs"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-1"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-muted-foreground italic px-2">No logs to display for this source.</div>
        ) : (
          filteredLogs.map(log => <LogLine key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
};
