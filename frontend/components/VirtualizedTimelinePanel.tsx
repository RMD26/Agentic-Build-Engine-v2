'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  FlaskConical,
  Settings,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';

export interface TimelineEvent {
  id: string;
  actor: 'CONDUCTOR' | 'RUNNER' | 'REVIEWER' | 'SYSTEM';
  status: 'success' | 'testing' | 'info' | 'warning' | 'error';
  timestamp: string;
  step: string;
  message: string;
}

export interface VirtualizedTimelinePanelProps {
  events: TimelineEvent[];
  activeEventId: string | null;
  onEventSelect?: (id: string) => void;
}

// ─── constants ────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 76; // px — fixed row height
const OVERSCAN = 8;     // extra rows rendered above/below the viewport

// ─── per-field style maps ──────────────────────────────────────────────────────

const ACTOR_STYLES: Record<TimelineEvent['actor'], { icon: React.ReactNode; badge: string }> = {
  CONDUCTOR: {
    icon: <BrainCircuit size={14} className="text-purple-400" />,
    badge: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
  },
  RUNNER: {
    icon: <TerminalSquare size={14} className="text-amber-400" />,
    badge: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  },
  REVIEWER: {
    icon: <ShieldCheck size={14} className="text-emerald-400" />,
    badge: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  },
  SYSTEM: {
    icon: <Settings size={14} className="text-slate-400" />,
    badge: 'bg-slate-500/10 text-slate-300 border border-slate-500/20',
  },
};

const STATUS_STYLES: Record<TimelineEvent['status'], { icon: React.ReactNode; dot: string }> = {
  success: {
    icon: <CheckCircle2 size={13} className="text-green-400" />,
    dot: 'bg-green-400',
  },
  testing: {
    icon: <FlaskConical size={13} className="text-amber-400" />,
    dot: 'bg-amber-400',
  },
  info: {
    icon: <Info size={13} className="text-cyan-400" />,
    dot: 'bg-cyan-400',
  },
  warning: {
    icon: <AlertTriangle size={13} className="text-yellow-400" />,
    dot: 'bg-yellow-400',
  },
  error: {
    icon: <XCircle size={13} className="text-red-400" />,
    dot: 'bg-red-400',
  },
};

// ─── single row ───────────────────────────────────────────────────────────────

interface RowProps {
  event: TimelineEvent;
  isActive: boolean;
  isLast: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}

const TimelineRow = React.memo<RowProps>(({ event, isActive, isLast, onClick, style }) => {
  const actor = ACTOR_STYLES[event.actor];
  const status = STATUS_STYLES[event.status];

  return (
    <div
      style={style}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-pressed={isActive}
      className={[
        'absolute left-0 right-0 flex items-start gap-3 px-4 cursor-pointer select-none',
        'border-b border-slate-800/50 transition-colors duration-150',
        isActive
          ? 'bg-cyan-500/10'
          : 'hover:bg-slate-800/40',
      ].join(' ')}
    >
      {/* Timeline gutter: dot + line */}
      <div className="flex flex-col items-center pt-[22px] shrink-0 w-4">
        <div className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
        {!isLast && (
          <div className="w-px flex-1 bg-slate-700/50 mt-1" style={{ minHeight: 28 }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-3">
        {/* Top row: timestamp + step + actor badge + status icon */}
        <div className="flex items-center gap-2 mb-1 min-w-0">
          <span className="font-mono text-[10px] text-slate-500 shrink-0">
            {event.timestamp}
          </span>
          <span className="font-mono text-[10px] text-slate-600 shrink-0">
            {event.step}
          </span>
          <span
            className={[
              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] shrink-0',
              actor.badge,
            ].join(' ')}
          >
            {actor.icon}
            {event.actor}
          </span>
          <span className="ml-auto shrink-0 flex items-center gap-1">
            {status.icon}
          </span>
        </div>

        {/* Message */}
        <p
          className={[
            'text-xs leading-snug truncate',
            isActive ? 'text-slate-100' : 'text-slate-400',
          ].join(' ')}
        >
          {event.message}
        </p>
      </div>
    </div>
  );
});
TimelineRow.displayName = 'TimelineRow';

// ─── main component ────────────────────────────────────────────────────────────

export const VirtualizedTimelinePanel: React.FC<VirtualizedTimelinePanelProps> = ({
  events,
  activeEventId,
  onEventSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Track container height with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });
    observer.observe(el);
    setContainerHeight(el.clientHeight);
    return () => observer.disconnect();
  }, []);

  // Scroll active item into view when activeEventId changes
  useLayoutEffect(() => {
    if (!activeEventId || !containerRef.current) return;
    const index = events.findIndex((e) => e.id === activeEventId);
    if (index === -1) return;

    const itemTop = index * ITEM_HEIGHT;
    const itemBottom = itemTop + ITEM_HEIGHT;
    const viewTop = containerRef.current.scrollTop;
    const viewBottom = viewTop + containerRef.current.clientHeight;

    if (itemTop < viewTop) {
      containerRef.current.scrollTop = itemTop;
    } else if (itemBottom > viewBottom) {
      containerRef.current.scrollTop = itemBottom - containerRef.current.clientHeight;
    }
  }, [activeEventId, events]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const totalHeight = events.length * ITEM_HEIGHT;

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    events.length - 1,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN,
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-2.5 border-b border-border bg-card/50 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Agent Timeline
        </h2>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
          {events.length.toLocaleString()} events
        </span>
      </div>

      {/* Virtualized scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative"
        style={{ contain: 'strict' }}
      >
        {/* Full-height sentinel so the scrollbar represents the whole list */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {events.slice(startIndex, endIndex + 1).map((event, i) => {
            const index = startIndex + i;
            return (
              <TimelineRow
                key={event.id}
                event={event}
                isActive={event.id === activeEventId}
                isLast={index === events.length - 1}
                onClick={() => onEventSelect?.(event.id)}
                style={{
                  top: index * ITEM_HEIGHT,
                  height: ITEM_HEIGHT,
                }}
              />
            );
          })}
        </div>

        {events.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground italic">
            No events to display.
          </p>
        )}
      </div>
    </div>
  );
};
