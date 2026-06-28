'use client';

import React, { useMemo, useState } from 'react';
import { VirtualizedTimelinePanel, TimelineEvent } from './VirtualizedTimelinePanel';

function buildEvents(count: number): TimelineEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `event-${index + 1}`,
    actor:
      index % 4 === 0
        ? 'CONDUCTOR'
        : index % 4 === 1
        ? 'RUNNER'
        : index % 4 === 2
        ? 'REVIEWER'
        : 'SYSTEM',
    status:
      index % 5 === 0
        ? 'success'
        : index % 5 === 1
        ? 'testing'
        : index % 5 === 2
        ? 'info'
        : index % 5 === 3
        ? 'warning'
        : 'error',
    timestamp: `15:${String(index % 60).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}.${String(index % 1000).padStart(3, '0')}`,
    step: `step-${(index % 12) + 1}`,
    message: `Pipeline event ${index + 1}: agent coordination update, validation checkpoint, and structured execution log entry for the SynapseAI build engine.`,
  }));
}

export default function TimelineDemo() {
  const events = useMemo(() => buildEvents(2000), []);
  const [activeEventId, setActiveEventId] = useState<string | null>(
    events[0]?.id ?? null,
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <VirtualizedTimelinePanel
        events={events}
        activeEventId={activeEventId}
        onEventSelect={setActiveEventId}
      />
    </div>
  );
}
