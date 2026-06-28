import React from 'react';
import { PERSONAS } from '../constants';
import { useEngineStore } from '../store';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export const PersonaGraph: React.FC = () => {
  const { activePhase, completedPhases } = useEngineStore();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Agent Persona Graph</h2>
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1"><Circle size={10} className="text-muted-foreground" /> PENDING</span>
          <span className="flex items-center gap-1"><Circle size={10} className="text-cyan-400 fill-cyan-400/20" /> ACTIVE</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-500" /> COMPLETE</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {PERSONAS.map((persona, index) => {
              const isActive = activePhase === persona.id;
              const isComplete = completedPhases.includes(persona.id);
              const isPending = !isActive && !isComplete;
              
              // Special styling for Ghost Agent (N) and GraphEngine (M)
              const isSpecial = persona.id === 'M' || persona.id === 'N';

              return (
                <div key={persona.id} className="relative group">
                  <div className={`
                    p-4 rounded-lg border transition-all duration-300 h-full flex flex-col
                    ${isActive ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : ''}
                    ${isComplete ? 'bg-card border-emerald-900/30' : ''}
                    ${isPending ? 'bg-card/50 border-border/50 opacity-70' : ''}
                    ${isSpecial && !isActive && !isComplete ? 'border-dashed border-purple-500/30' : ''}
                  `}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`
                          text-xs font-mono font-bold px-2 py-0.5 rounded-md
                          ${isActive ? 'bg-cyan-500/20 text-cyan-400' : ''}
                          ${isComplete ? 'bg-emerald-500/10 text-emerald-500' : ''}
                          ${isPending && !isSpecial ? 'bg-muted text-muted-foreground' : ''}
                          ${isPending && isSpecial ? 'bg-purple-500/10 text-purple-400' : ''}
                        `}>
                          [{persona.id}]
                        </span>
                        <h3 className={`font-semibold text-sm ${isActive ? 'text-cyan-100' : 'text-foreground'}`}>
                          {persona.name}
                        </h3>
                      </div>
                      {isActive && <Circle size={16} className="text-cyan-400 animate-pulse fill-cyan-400/20" />}
                      {isComplete && <CheckCircle2 size={16} className="text-emerald-500" />}
                      {isPending && <Circle size={16} className="text-muted-foreground" />}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-1 font-medium">{persona.role}</div>
                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed flex-1">
                      {persona.description}
                    </p>
                  </div>

                  {/* Connector Arrow (except for last item) */}
                  {index < PERSONAS.length - 1 && (
                    <div className="hidden xl:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-muted">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
