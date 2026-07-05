import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { PersonaGraph } from './components/PersonaGraph';
import { AgentTimeline } from './components/AgentTimeline';
import { Terminal } from './components/Terminal';
import { ChatPanel } from './components/ChatPanel';
import { SynapseConfigEditor } from './components/SynapseConfigEditor';
import { ApprovalBanner } from './components/ApprovalBanner';
import { useEngineStore } from './store';
import { ConductorEngine } from './services/engine';
import { TimelineEvent, WebviewMessage, PhaseId } from './types';
import { Network, ListTree } from 'lucide-react';

// Maps the engine's SystemState phases to the PersonaGraph PhaseId nodes
const PHASE_TO_PERSONA: Partial<Record<string, PhaseId>> = {
  ANALYSIS: 'A',
  CODING: 'F',
  REVIEW: 'L',
  TESTING: 'E',
};

const App: React.FC = () => {
  const { 
    isRunning, 
    addLog, 
    stopEngine,
    config,
    setConductorState,
    setPendingApproval,
    addChatMessage,
    setActivePhase,
    markPhaseComplete,
  } = useEngineStore();

  // Local state for the Webview Timeline
  const [timelineLogs, setTimelineLogs] = useState<TimelineEvent[]>([]);
  const [activeView, setActiveView] = useState<'timeline' | 'graph'>('timeline');
  const prevPhaseRef = useRef<string | null>(null);

  // ============================================================================
  // WEBVIEW LISTENER (Frontend)
  // ============================================================================
  useEffect(() => {
    const handleMessage = (event: MessageEvent<WebviewMessage>) => {
      const message = event.data;
      
      if (message?.type === 'AGENT_STATE_UPDATE') {
        const newState = message.payload.state;
        setConductorState(newState);
        
        // --- PersonaGraph phase sync ---
        const prevPhase = prevPhaseRef.current;
        const newPersonaId = PHASE_TO_PERSONA[newState.currentPhase];
        const prevPersonaId = prevPhase ? PHASE_TO_PERSONA[prevPhase] : null;

        if (prevPersonaId && prevPersonaId !== newPersonaId) {
          markPhaseComplete(prevPersonaId);
        }

        if (newPersonaId) {
          setActivePhase(newPersonaId);
        } else if (newState.currentPhase === 'SUCCESS' || newState.currentPhase === 'FAILURE') {
          setActivePhase(null);
        }

        prevPhaseRef.current = newState.currentPhase;
        
        if (message.payload.log) {
          const log = message.payload.log;
          
          // Immutably add new log to the timeline
          setTimelineLogs((prev) => [...prev, log]);
          
          const isError = log.status === 'error';
          const isSuccess = log.status === 'success';
          
          addLog(
            log.actor,
            log.message,
            isError ? 'error' : isSuccess ? 'success' : 'info',
            'orchestrator'
          );
          
          addChatMessage({
            role: 'agent',
            type: 'thought',
            content: `[${log.actor}] ${log.message}`
          });
        }
        
        if (newState.currentPhase === 'SUCCESS' || newState.currentPhase === 'FAILURE') {
           stopEngine();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // EXTENSION HOST SIMULATOR (Backend)
  // ============================================================================
  useEffect(() => {
    if (!isRunning) return;

    // Reset timeline and phase state on new run
    setTimelineLogs([]);
    setActivePhase(null);
    prevPhaseRef.current = null;

    const activeConfig = config.synapseConfig;

    const engine = new ConductorEngine(
      config.task || 'Implement secure validation helper for session tokens',
      "/workspace",
      activeConfig,
      (message) => {
        window.postMessage(message, '*');
      },
      (operation, resumeToken) => {
        setPendingApproval({ operation, resumeToken });
      }
    );

    engine.executeWorkflow();

    return () => {
      setPendingApproval(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground">
      <Header />
      <div className="flex flex-1 min-h-0">
        <ConfigPanel />
        
        <div className="flex flex-col flex-1 min-w-0 border-r border-border">
          {/* View Toggle Tabs */}
          <div className="flex items-center bg-card border-b border-border px-4 shrink-0">
            <button 
              onClick={() => setActiveView('timeline')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'timeline' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListTree size={16} />
              Agent Timeline
            </button>
            <button 
              onClick={() => setActiveView('graph')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'graph' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Network size={16} />
              Persona Graph
            </button>
          </div>

          {/* Main Content Area */}
          <AnimatePresence mode="wait">
          {activeView === 'timeline' ? (
            <motion.div
              key="timeline"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
            >
              <AgentTimeline logs={timelineLogs} />
            </motion.div>
          ) : (
            <motion.div
              key="graph"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
            >
              <PersonaGraph />
            </motion.div>
          )}
          </AnimatePresence>
          
          <ApprovalBanner />
          <Terminal />
        </div>
        
        <ChatPanel />
      </div>
      <SynapseConfigEditor />
    </div>
  );
};

export default App;
