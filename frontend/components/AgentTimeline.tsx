import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { TimelineEvent } from '../types';
import { CollapsiblePanel } from './CollapsiblePanel';
import { getActorIcon, getStatusColorClass } from '../utils/timeline';
import { formatLogTime } from '../utils/formatTime';

interface AgentTimelineProps {
  logs: TimelineEvent[];
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Agent Activity Timeline</h2>
        <div className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {logs.length} Events Recorded
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto relative">
          {/* Vertical Line */}
          <div className="absolute left-[23px] top-4 bottom-4 w-px bg-border"></div>

          <div className="space-y-2 relative">
            {logs.length === 0 ? (
              <div className="text-sm text-muted-foreground italic pl-14">Awaiting workflow execution...</div>
            ) : (
              <AnimatePresence initial={false}>
              {logs.map((log, index) => {
                const isLast = index === logs.length - 1;
                const isSuccess = log.status === 'success';
                const isFailure = log.status === 'error';

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex gap-4 relative group"
                  >
                    {/* Timeline Node */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 bg-background z-10 transition-colors duration-300 mt-1 ${
                      isSuccess ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
                      isFailure ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                      isLast ? 'border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'border-border'
                    }`}>
                      {isSuccess ? <CheckCircle2 size={20} className="text-green-500" /> :
                       isFailure ? <XCircle size={20} className="text-red-500" /> :
                       getActorIcon(log.actor)}
                    </div>

                    {/* Content Card using the new CollapsiblePanel */}
                    <div className="flex-1">
                      <CollapsiblePanel
                        title={log.actor}
                        subtitle={formatLogTime(log.timestamp)}
                        badgeText={log.step ?? log.status}
                        badgeColorClass={getStatusColorClass(log.status)}
                        defaultExpanded={isLast || isFailure || isSuccess}
                      >
                        <p className={`text-sm leading-relaxed ${isFailure ? 'text-red-400' : 'text-slate-300'}`}>
                          {log.message}
                        </p>
                      </CollapsiblePanel>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
