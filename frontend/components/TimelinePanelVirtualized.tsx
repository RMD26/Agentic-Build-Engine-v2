'use client';

import React, { memo, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CollapsiblePanel } from './CollapsiblePanel';
import type { TimelineActor, TimelineEvent, TimelineStatus } from './panelTypes';

interface TimelinePanelVirtualizedProps {
  events: TimelineEvent[];
  expanded?: boolean;
  setExpanded?: (expanded: boolean) => void;
  activeEventId?: string | null;
  onSelectEvent?: (event: TimelineEvent) => void;
  height?: number;
  overscan?: number;
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const actorTone: Record<TimelineActor, string> = {
  CONDUCTOR: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
  CODER:     'text-blue-400   border-blue-500/40   bg-blue-500/10',
  REVIEWER:  'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  RUNNER:    'text-amber-400  border-amber-500/40  bg-amber-500/10',
  SYSTEM:    'text-slate-400  border-slate-500/40  bg-slate-500/10',
};

const statusTone: Record<TimelineStatus, string> = {
  pending: 'bg-slate-500/10  text-slate-400  border-slate-500/20',
  running: 'bg-cyan-500/10   text-cyan-300   border-cyan-500/20',
  success: 'bg-green-500/10  text-green-400  border-green-500/20',
  failure: 'bg-red-500/10    text-red-400    border-red-500/20',
  warning: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
  skipped: 'bg-slate-700/30  text-slate-500  border-slate-700/30',
};

const statusDot: Record<TimelineStatus, string> = {
  pending: 'bg-slate-500',
  running: 'bg-cyan-400 animate-pulse',
  success: 'bg-green-500',
  failure: 'bg-red-500',
  warning: 'bg-amber-400',
  skipped: 'bg-slate-600',
};

const ITEM_HEIGHT = 72; // px — estimated row height for the virtualizer

interface TimelineRowProps {
  event: TimelineEvent;
  isActive: boolean;
  onSelect: (event: TimelineEvent) => void;
}

const TimelineRow = memo(({ event, isActive, onSelect }: TimelineRowProps) => {
  const handleClick = useCallback(() => onSelect(event), [event, onSelect]);
  const timestamp = useMemo(
    () => new Date(event.timestamp).toISOString().split('T')[1].slice(0, 12),
    [event.timestamp],
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 cursor-pointer select-none',
        'border-b border-slate-800/60 transition-colors duration-150',
        isActive
          ? 'bg-slate-800/60 ring-1 ring-inset ring-cyan-500/30'
          : 'hover:bg-slate-800/30',
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      aria-pressed={isActive}
    >
      {/* Status dot */}
      <span className="mt-1.5 flex-shrink-0">
        <span
          className={cn('block h-2.5 w-2.5 rounded-full', statusDot[event.status])}
          aria-label={event.status}
        />
      </span>

      {/* Actor badge */}
      <span
        className={cn(
          'flex-shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
          actorTone[event.actor],
        )}
      >
        {event.actor}
      </span>

      {/* Title + detail */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-100">{event.title}</p>
        {event.detail && (
          <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">{event.detail}</p>
        )}
      </div>

      {/* Timestamp + status badge */}
      <div className="ml-2 flex flex-shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-[10px] text-slate-600">{timestamp}</span>
        <span
          className={cn(
            'rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
            statusTone[event.status],
          )}
        >
          {event.status}
        </span>
      </div>
    </motion.div>
  );
});
TimelineRow.displayName = 'TimelineRow';

export const TimelinePanelVirtualized: React.FC<TimelinePanelVirtualizedProps> = ({
  events,
  expanded,
  setExpanded,
  activeEventId = null,
  onSelectEvent,
  height = 480,
  overscan = 5,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (event: TimelineEvent) => onSelectEvent?.(event),
    [onSelectEvent],
  );

  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <CollapsiblePanel
      title="Agent Activity Timeline"
      subtitle={`${events.length} event${events.length !== 1 ? 's' : ''}`}
      defaultExpanded={expanded ?? true}
      onToggle={setExpanded}
      contentClassName="p-0"
    >
      <div
        ref={scrollRef}
        style={{ height, overflowY: 'auto' }}
        className="relative"
      >
        {events.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm italic text-slate-500">
            Awaiting workflow execution…
          </div>
        ) : (
          <div
            style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
          >
            <AnimatePresence initial={false}>
              {virtualItems.map((virtualRow) => {
                const event = events[virtualRow.index];
                return (
                  <div
                    key={event.id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <TimelineRow
                      event={event}
                      isActive={event.id === activeEventId}
                      onSelect={handleSelect}
                    />
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
};
