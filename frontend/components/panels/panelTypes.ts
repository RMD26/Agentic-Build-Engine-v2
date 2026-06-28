import React from 'react';

// ─── Shared panel prop types ──────────────────────────────────────────────────

export interface BasePanelProps {
  className?: string;
}

export type PanelVariant = 'default' | 'ghost' | 'bordered';

export interface CollapsiblePanelProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColorClass?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  persistKey?: string;
  onToggle?: (expanded: boolean) => void;
  actions?: React.ReactNode;
  contentClassName?: string;
  className?: string;
}

export interface TimelinePanelProps extends BasePanelProps {
  logs: TimelineEntry[];
  /** Height (px) of each timeline row – used for virtualisation. Default: 80 */
  itemHeight?: number;
}

export interface TimelineEntry {
  id?: string | number;
  timestamp: number;
  agent: string;
  message: string;
  phase: string;
}

export interface LogPanelProps extends BasePanelProps {
  logs: LogPanelEntry[];
  onClear?: () => void;
  /** Show the source-filter tab bar. Default: true */
  showTabs?: boolean;
}

export interface LogPanelEntry {
  id: string;
  timestamp: number;
  phase: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  source: string;
}

export interface ContextSidebarPanelProps extends BasePanelProps {
  /** Sections rendered inside the scrollable body area */
  children: React.ReactNode;
  /** Slot rendered in the sticky footer (action buttons, etc.) */
  footer?: React.ReactNode;
  title?: string;
  headerActions?: React.ReactNode;
}
