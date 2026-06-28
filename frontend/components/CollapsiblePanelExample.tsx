import React from 'react';
import { CollapsiblePanel } from './CollapsiblePanel';
import { Play, Settings, Trash2 } from 'lucide-react';

export const CollapsiblePanelExample: React.FC = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4 bg-background min-h-screen">
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
        Panel Components Demo
      </h2>

      {/* Example 1: Standard Panel with Actions and Persistence */}
      <CollapsiblePanel
        title="Agent Execution Configuration"
        subtitle="src/config/agent-settings.json"
        badgeText="Active"
        badgeColorClass="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        persistKey="agent-config-panel"
        defaultExpanded={true}
        actions={
          <>
            <button className="p-1 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors">
              <Play size={14} />
            </button>
            <button className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
              <Settings size={14} />
            </button>
          </>
        }
      >
        <div className="space-y-2 font-mono text-xs text-muted-foreground">
          <p>Configure the strictness and boundaries of the autonomous agent loop.</p>
          <pre className="p-2 bg-[#0a0a0a] rounded border border-border/50 text-cyan-300/80 overflow-x-auto">
{`{
  "maxIterations": 5,
  "strictSecurityMode": true,
  "executionEnvironment": "sandboxed-container"
}`}
          </pre>
        </div>
      </CollapsiblePanel>

      {/* Example 2: Disabled Panel */}
      <CollapsiblePanel
        title="Legacy Build Artifacts"
        subtitle="No artifacts found in current workspace"
        badgeText="Empty"
        badgeColorClass="bg-muted text-muted-foreground border-border"
        disabled={true}
        actions={
          <button disabled className="p-1 text-muted-foreground/50 rounded cursor-not-allowed">
            <Trash2 size={14} />
          </button>
        }
      >
        <p>This content will not be visible because the panel is disabled and collapsed.</p>
      </CollapsiblePanel>
    </div>
  );
};
