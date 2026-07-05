import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Bot, User, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { useEngineStore } from '../store';
import { DiffViewer } from './DiffViewer';
import { SynapseAI, ConversationTurn } from '../services/synapse';

const CHAT_SYSTEM_PROMPT = `You are SynapseAI, an intelligent multi-agent coding assistant embedded in the Agentic Build Engine.
Help developers design, debug, and improve their applications.
Be concise and specific. When suggesting code changes, name the exact file and show only the relevant snippet.
Do not invent external packages that are not already part of the project.`;

export const ChatPanel: React.FC = () => {
  const { chatMessages, addChatMessage, config } = useEngineStore();
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input.trim();
    setInput('');

    addChatMessage({ role: 'user', content: userText });

    if (config.synapseConfig.llmProvider === 'vertex-ai') {
      setIsGenerating(true);
      try {
        const ai = new SynapseAI(config.synapseConfig);

        // Build history from the last 10 non-system messages
        const history: ConversationTurn[] = chatMessages
          .filter((m) => m.role !== 'system' && m.type !== 'thought')
          .slice(-10)
          .map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.content
          }));

        const response = await ai.generate(CHAT_SYSTEM_PROMPT, userText, history);

        addChatMessage({ role: 'agent', content: response });
      } catch (err: any) {
        addChatMessage({
          role: 'agent',
          content: `⚠️ SynapseAI is unavailable: ${err?.message ?? 'Unknown error'}. Check that the backend proxy is running.`
        });
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Simulation fallback (custom provider or no backend)
      setTimeout(() => {
        addChatMessage({
          role: 'agent',
          type: 'thought',
          content: 'Querying GraphEngine for auth state dependencies... Found 3 files. Planning modifications for NextAuth v5 compatibility.'
        });
      }, 800);

      setTimeout(() => {
        addChatMessage({
          role: 'agent',
          content: 'I analyzed the request. Here are the necessary changes across the authentication flow and UI components.',
          diffs: [
            {
              filename: 'src/app/api/auth/route.ts',
              status: 'modified',
              additions: 4,
              deletions: 1,
              content: ` import { NextAuth } from 'next-auth';
-export const GET = NextAuth(authOptions);
+import { validateSession } from '@/lib/security';
+
+export const GET = async (req) => {
+  await validateSession(req);
+  return NextAuth(authOptions)(req);
+};`
            },
            {
              filename: 'src/components/Login.tsx',
              status: 'modified',
              additions: 2,
              deletions: 0,
              content: ` export const Login = () => {
+  const { status } = useSession();
   return (
     <div className="p-4">
+      {status === 'loading' && <Spinner />}
       <LoginForm />
     </div>
   );`
            }
          ]
        });
      }, 2500);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        addChatMessage({
          role: 'user',
          content: 'Please fix the alignment issue shown in this screenshot.',
          image: event.target?.result as string
        });
        
        setTimeout(() => {
          addChatMessage({
            role: 'agent',
            type: 'thought',
            content: 'Analyzing image via Vertex AI Vision... Detected flexbox misalignment in Header component.'
          });
        }, 1000);

        setTimeout(() => {
          addChatMessage({
            role: 'agent',
            content: 'I see the issue. The flex container is missing `items-center`. I will patch the Tailwind classes in `Header.tsx`.',
          });
        }, 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-96 border-l border-border bg-card flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-border flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider bg-muted/30">
        <Sparkles size={16} className="text-cyan-500" />
        Context Engine
      </div>
      
      <div 
        className={`flex-1 overflow-y-auto p-4 space-y-4 relative ${isDragging ? 'bg-cyan-500/5' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        ref={scrollRef}
      >
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-cyan-500/50 rounded-lg m-2 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-cyan-400 flex flex-col items-center gap-2">
              <ImageIcon size={32} />
              <span className="font-medium">Drop screenshot to analyze</span>
            </div>
          </div>
        )}

        {chatMessages.map((msg) => {
          const isThought = msg.type === 'thought';
          
          return (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 
                msg.role === 'system' ? 'bg-purple-500/20 text-purple-400' : 
                isThought ? 'bg-transparent border border-dashed border-muted-foreground text-muted-foreground' : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : 
                 isThought ? <BrainCircuit size={16} /> : <Bot size={16} />}
              </div>
              <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 
                  isThought ? 'bg-transparent border border-dashed border-border text-muted-foreground italic text-xs' : 'bg-muted text-foreground'
                }`}>
                  {msg.content}
                </div>
                {msg.image && (
                  <img src={msg.image} alt="Uploaded context" className="mt-2 rounded-md border border-border max-w-full h-auto" />
                )}
                {msg.diffs && <DiffViewer files={msg.diffs} />}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-400">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="px-3 py-2 rounded-lg text-sm bg-muted text-muted-foreground italic">
              SynapseAI is thinking…
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-background">
        <div className="relative flex items-center">
          <button className="absolute left-3 text-muted-foreground hover:text-foreground transition-colors">
            <ImageIcon size={18} />
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Coder or drop image..."
            disabled={isGenerating}
            className="w-full bg-input border border-border rounded-full pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-shadow disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-muted disabled:text-muted-foreground text-white rounded-full transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
