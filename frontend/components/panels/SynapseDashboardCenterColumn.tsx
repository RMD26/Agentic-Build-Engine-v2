'use client';

import React, { useMemo, useState } from 'react';
import { TimelinePanelVirtualized } from '@/components/panels/TimelinePanelVirtualized';
import type { TimelineEvent } from '@/components/panels/panelTypes';
import { LogPanel } from '@/components/panels/LogPanel';
import { ContextSidebarPanel } from '@/components/panels/ContextSidebarPanel';

function buildTimelineEvents(): TimelineEvent[] {
  return [
    {
      id: 'evt-1',
      actor: 'CONDUCTOR',
      status: 'testing',
      timestamp: '15:00:35.762',
      step: 'confirm',
      message: 'Human confirmation received. Executing safe workspace mutations.',
    },
    {
      id: 'evt-2',
      actor: 'RUNNER',
      status: 'testing',
      timestamp: '15:00:35.766',
      step: 'validate',
      message: 'Running validation suite command: npm run test -- --runTestsByPath src/services/secureAuth.test.ts',
    },
    {
      id: 'evt-3',
      actor: 'CONDUCTOR',
      status: 'success',
      timestamp: '15:00:37.268',
      step: 'complete',
      message: 'All multi-agent stages resolved perfectly. Task completed successfully.',
    },
  ];
}

export default function SynapseDashboardCenterColumn() {
  const events = useMemo(() => buildTimelineEvents(), []);
  const [timelineExpanded, setTimelineExpanded] = useState(true);
  const [activeEventId, setActiveEventId] = useState<string | null>(events[0]?.id ?? null);

  return (
    <div className="flex h-full w-full min-h-0 bg-slate-950 text-foreground">
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <TimelinePanelVirtualized
          events={events}
          expanded={timelineExpanded}
          onToggleExpand={() => setTimelineExpanded((prev) => !prev)}
          activeEventId={activeEventId}
          onEventSelect={setActiveEventId}
        />
        <LogPanel events={events} />
      </div>
      <ContextSidebarPanel
        activeEvent={events.find((e) => e.id === activeEventId) ?? null}
      />
    </div>
  );
}
