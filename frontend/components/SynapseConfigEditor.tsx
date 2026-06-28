import React from 'react';
import { X, FileJson, Shield, Cpu, TerminalSquare } from 'lucide-react';
import { useEngineStore } from '../store';
import { SynapseConfig } from '../types';

export const SynapseConfigEditor: React.FC = () => {
  const { config, setConfig, isConfigModalOpen, setConfigModalOpen } = useEngineStore();

  if (!isConfigModalOpen) return null;

  const updateSynapseConfig = (updates: Partial<SynapseConfig>) => {
    setConfig({
      synapseConfig: { ...config.synapseConfig, ...updates }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <FileJson size={18} className="text-cyan-500" />
            <span>synapseai.json</span>
            <span className="text-xs font-normal text-muted-foreground ml-2 px-2 py-0.5 bg-muted rounded-md">Workspace Configuration</span>
          </div>
          <button 
            onClick={() => setConfigModalOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Orchestration Settings */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Cpu size={16} className="text-purple-400" />
              Orchestration & LLM
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">LLM Provider</label>
                <select 
                  value={config.synapseConfig.llmProvider}
                  onChange={(e) => updateSynapseConfig({ llmProvider: e.target.value as any })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  <option value="vertex-ai">Google Vertex AI (Gemini Pro/Flash)</option>
                  <option value="custom">Custom Endpoint</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Max Self-Healing Iterations</label>
                <input 
                  type="number" 
                  min="1" max="10"
                  value={config.synapseConfig.maxIterations}
                  onChange={(e) => updateSynapseConfig({ maxIterations: parseInt(e.target.value) })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
                <p className="text-[10px] text-muted-foreground">Limits the Coder ↔ Runner loop to prevent infinite cycles.</p>
              </div>
            </div>
          </section>

          {/* Security & Review Settings */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Shield size={16} className="text-emerald-400" />
              Security & Reviewer Agent
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 flex flex-col justify-center pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.synapseConfig.strictSecurityMode}
                    onChange={(e) => updateSynapseConfig({ strictSecurityMode: e.target.checked })}
                    className="rounded border-input bg-background text-cyan-500 focus:ring-cyan-500/50 w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground font-medium">Strict Security Mode</span>
                    <span className="text-[10px] text-muted-foreground">Enforce zero-trust CSP checks and dependency whitelists.</span>
                  </div>
                </label>
              </div>

              <div className="space-y-2 flex flex-col justify-center pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.synapseConfig.autoFixEnabled}
                    onChange={(e) => updateSynapseConfig({ autoFixEnabled: e.target.checked })}
                    className="rounded border-input bg-background text-cyan-500 focus:ring-cyan-500/50 w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground font-medium">Auto-Fix Permissions</span>
                    <span className="text-[10px] text-muted-foreground">Allow Coder to apply Reviewer suggestions automatically.</span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Execution Environment */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <TerminalSquare size={16} className="text-amber-400" />
              Runner Execution Environment
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                <input 
                  type="radio" 
                  name="execEnv"
                  value="sandboxed-container"
                  checked={config.synapseConfig.executionEnvironment === 'sandboxed-container'}
                  onChange={(e) => updateSynapseConfig({ executionEnvironment: e.target.value as any })}
                  className="mt-1 text-cyan-500 focus:ring-cyan-500/50"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">Sandboxed Container (Recommended)</div>
                  <div className="text-xs text-muted-foreground mt-1">Executes code and tests in an isolated cloud container. Mitigates risks of hallucinated malicious dependencies.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                <input 
                  type="radio" 
                  name="execEnv"
                  value="local-terminal"
                  checked={config.synapseConfig.executionEnvironment === 'local-terminal'}
                  onChange={(e) => updateSynapseConfig({ executionEnvironment: e.target.value as any })}
                  className="mt-1 text-cyan-500 focus:ring-cyan-500/50"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">Local VS Code Terminal</div>
                  <div className="text-xs text-muted-foreground mt-1">Executes directly in your workspace terminal via Extension API. Faster, but requires high trust.</div>
                </div>
              </label>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button 
            onClick={() => setConfigModalOpen(false)}
            className="px-4 py-2 rounded-md text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
