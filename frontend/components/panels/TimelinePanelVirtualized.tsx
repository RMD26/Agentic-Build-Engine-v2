import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  Code2,
  Settings,
  ShieldCheck,
  TerminalSquare,
  XCircle,
} from 'lucide-react';
import { CollapsiblePanel } from './CollapsiblePanel';
import { TimelinePanelProps, TimelineEntry } from './panelTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_ITEM_HEIGHT = 80;
/** Extra items rendered above / below the visible window to reduce blank flicker */
const OVERSCAN = 3;

function getAgentIcon(agent: string): React.ReactElement {
  switch (agent) {
    case 'CONDUCTOR':
      return <BrainCircuit size={16} className="text-purple-400" />;
    case 'CODER':
      return <Code2 size={16} className="text-blue-400" />;
    case 'REVIEWER':
      return <ShieldCheck size={16} className="text-emerald-400" />;
    case 'RUNNER':
      return <TerminalSquare size={16} className="text-amber-400" />;
    default:
      return <Settings size={16} className="text-gray-400" />;
  }
}

function getPhaseColorClass(phase: string): string {
  switch (phase) {
    case 'ANALYSIS':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'CODING':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'REVIEW':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'TESTING':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'SUCCESS':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'FAILURE':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}

// ─── Virtual list hook ────────────────────────────────────────────────────────

interface VirtualWindow {
  startIndex: number;
  endIndex: number;
  offsetTop: number;
  totalHeight: number;
}

function useVirtualWindow(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  itemCount: number,
  itemHeight: number,
): VirtualWindow {
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(600);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setClientHeight(el.clientHeight);
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef]);

  const totalHeight = itemCount * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - OVERSCAN);
  const visibleCount = Math.ceil(clientHeight / itemHeight);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + OVERSCAN * 2);
  const offsetTop = startIndex * itemHeight;

  return { startIndex, endIndex, offsetTop, totalHeight };
}

// ─── Timeline Row ─────────────────────────────────────────────────────────────

interface TimelineRowProps {
  entry: TimelineEntry;
  index: number;
  isLast: boolean;
  style: React.CSSProperties;
}

const TimelineRow: React.FC<TimelineRowProps> = ({ entry, isLast, style }) => {
  const isSuccess = entry.phase === 'SUCCESS';
  const isFailure = entry.phase === 'FAILURE';
  const time = new Date(entry.timestamp).toISOString().split('T')[1].slice(0, -1);

  return (
    <div style={style} className="absolute left-0 right-0 px-6 flex gap-4">
      {/* Node */}
      <div
        className={[
          'w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 bg-background z-10 transition-colors duration-300 mt-1',
          isSuccess
            ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
            : isFailure
            ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
            : isLast
            ? 'border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            : 'border-border',
        ].join(' ')}
      >
        {isSuccess ? (
          <CheckCircle2 size={20} className="text-green-500" />
        ) : isFailure ? (
          <XCircle size={20} className="text-red-500" />
        ) : (
          getAgentIcon(entry.agent)
        )}
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0">
        <CollapsiblePanel
          title={entry.agent}
          subtitle={time}
          badgeText={entry.phase}
          badgeColorClass={getPhaseColorClass(entry.phase)}
          defaultExpanded={isLast || isFailure || isSuccess}
        >
          <p className={`text-sm leading-relaxed ${isFailure ? 'text-red-400' : 'text-slate-300'}`}>
            {entry.message}
          </p>
        </CollapsiblePanel>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * TimelinePanelVirtualized
 *
 * Renders an agent activity timeline that only mounts DOM nodes for the rows
 * currently visible in the scroll viewport (+ an overscan buffer), keeping
 * memory and render time proportional to the viewport rather than total log
 * count.
 */
export const TimelinePanelVirtualized: React.FC<TimelinePanelProps> = ({
  logs,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const { startIndex, endIndex, offsetTop, totalHeight } = useVirtualWindow(
    scrollRef,
    logs.length,
    itemHeight,
  );

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length, autoScroll]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setAutoScroll(atBottom);
  }, []);

  const visibleItems = logs.slice(startIndex, endIndex + 1);

  return (
    <div className={`flex-1 flex flex-col min-h-0 bg-background${className ? ` ${className}` : ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Agent Activity Timeline
        </h2>
        <div className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {logs.length} Events Recorded
        </div>
      </div>

      {/* Virtual scroll container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {logs.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground italic">
            Awaiting workflow execution…
          </div>
        ) : (
          <div className="max-w-3xl mx-auto relative" style={{ height: totalHeight }}>
            {/* Vertical connector line */}
            <div className="absolute left-[47px] top-0 bottom-0 w-px bg-border" />

            {visibleItems.map((entry, i) => {
              const absoluteIndex = startIndex + i;
              return (
                <TimelineRow
                  key={entry.id ?? absoluteIndex}
                  entry={entry}
                  index={absoluteIndex}
                  isLast={absoluteIndex === logs.length - 1}
                  style={{
                    top: offsetTop + i * itemHeight,
                    height: itemHeight,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
