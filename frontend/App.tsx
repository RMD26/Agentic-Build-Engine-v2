import React, { useEffect, useState } from 'react';
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
import { StateLog, WebviewMessage } from './types';
import { Network, ListTree } from 'lucide-react';

const App: React.FC = () => {
  const { 
    isRunning, 
    addLog, 
    stopEngine,
    config,
    setConductorState,
    setPendingApproval,
    addChatMessage
  } = useEngineStore();

  // Local state for the Webview Timeline
  const [timelineLogs, setTimelineLogs] = useState<StateLog[]>([]);
  const [activeView, setActiveView] = useState<'timeline' | 'graph'>('timeline');

  // ============================================================================
  // WEBVIEW LISTENER (Frontend)
  // Bezpečné zachytávanie správ posielaných z Extension Hostu cez VS Code API Bridge
  // ============================================================================
  useEffect(() => {
    const handleMessage = (event: MessageEvent<WebviewMessage>) => {
      const message = event.data;
      
      if (message?.type === 'AGENT_STATE_UPDATE') {
        setConductorState(message.payload.state);
        
        if (message.payload.log) {
          const log = message.payload.log;
          
          // Immutabilné pridanie nového logu do časovej osi
          setTimelineLogs((prev) => [...prev, log]);
          
          // Sync with global store for Terminal and Chat
          const isError = log.phase === 'FAILURE';
          const isSuccess = log.phase === 'SUCCESS';
          
          addLog(
            log.agent,
            log.message,
            isError ? 'error' : isSuccess ? 'success' : 'info',
            'orchestrator'
          );
          
          addChatMessage({
            role: 'agent',
            type: 'thought',
            content: `[${log.agent}] ${log.message}`
          });
        }
        
        if (message.payload.state.currentPhase === 'SUCCESS' || message.payload.state.currentPhase === 'FAILURE') {
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

    // Reset timeline on new run
    setTimelineLogs([]);

    const activeConfig = config.synapseConfig;

    const engine = new ConductorEngine(
      "Implement secure validation helper for session tokens",
      "/workspace",
      activeConfig,
      (message) => {
        // Post messaging system bridge to your React Webview instance
        window.postMessage(message, '*');
      },
      (operation, resumeToken) => {
        // Display interaction prompts directly inside VS Code UI or via webview action panel
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
