import { Box, LayoutPanelLeft, Server, Terminal as TerminalIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Source-filter tabs shared by the log views (Terminal / LogPanel).
 * `id` values line up with the `LogSource` union in ../types.
 */
export const LOG_SOURCE_TABS: ReadonlyArray<{ id: string; label: string; Icon: LucideIcon }> = [
  { id: 'all', label: 'All Logs', Icon: TerminalIcon },
  { id: 'orchestrator', label: 'MAS Orchestrator', Icon: Server },
  { id: 'extension-host', label: 'Extension Host', Icon: LayoutPanelLeft },
  { id: 'runner-sandbox', label: 'Runner Sandbox', Icon: Box },
];

export interface LogTypeMeta {
  colorClass: string;
  prefix: string;
}

/**
 * Per-log-type presentation (text colour + gutter prefix) shared by log views.
 */
export const LOG_TYPE_META: Record<string, LogTypeMeta> = {
  info: { colorClass: 'text-blue-400', prefix: 'i' },
  success: { colorClass: 'text-emerald-400', prefix: '✓' },
  warning: { colorClass: 'text-amber-400', prefix: '⚠' },
  error: { colorClass: 'text-red-400', prefix: '✖' },
  system: { colorClass: 'text-purple-400', prefix: '⚙' },
};

export const DEFAULT_LOG_TYPE_META: LogTypeMeta = {
  colorClass: 'text-muted-foreground',
  prefix: '>',
};
