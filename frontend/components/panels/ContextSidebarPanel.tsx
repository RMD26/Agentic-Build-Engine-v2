import React from 'react';
import { Settings } from 'lucide-react';
import { ContextSidebarPanelProps } from './panelTypes';

/**
 * ContextSidebarPanel
 *
 * A generic sidebar container with:
 *  - a fixed header row (title + optional action slot)
 *  - a scrollable body area for arbitrary children
 *  - a sticky footer slot (e.g. action buttons)
 *
 * Compose engine-specific controls inside `children` and pass control buttons
 * via the `footer` prop.
 */
export const ContextSidebarPanel: React.FC<ContextSidebarPanelProps> = ({
  children,
  footer,
  title = 'Context',
  headerActions,
  className,
}) => {
  return (
    <div
      className={[
        'w-72 border-r border-border bg-card flex flex-col h-full shrink-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-border flex items-center justify-between text-sm font-semibold text-foreground uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-muted-foreground" />
          {title}
        </div>

        {headerActions && (
          <div className="flex items-center gap-1">{headerActions}</div>
        )}
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <div className="p-4 flex-1 overflow-y-auto space-y-5">{children}</div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      {footer && (
        <div className="p-4 border-t border-border space-y-3 bg-muted/30">
          {footer}
        </div>
      )}
    </div>
  );
};
