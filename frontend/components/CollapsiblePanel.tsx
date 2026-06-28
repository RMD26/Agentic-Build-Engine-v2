import React, { useState } from 'react';

// Strict type definitions for panel properties
interface CollapsiblePanelProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColorClass?: string; // e.g., 'bg-blue-500/10 text-blue-400'
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

/**
 * CollapsiblePanel - A type-safe, collapsible UI component designed for VS Code Webview.
 * Features isolated state management and a clean Tailwind design tailored for dark mode.
 */
export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  subtitle,
  badgeText,
  badgeColorClass = 'bg-slate-700 text-slate-300',
  defaultExpanded = false,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="mb-3 border rounded-lg border-slate-700/60 bg-slate-900/40 overflow-hidden transition-all duration-200 shadow-sm">
      {/* Panel Header - Clickable zone for toggling state */}
      <button
        type="button"
        className="w-full flex items-center justify-between p-3 text-left bg-slate-800/40 hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-3 truncate">
          {/* Chevron Icon with state-based rotation animation */}
          <svg
            className={`w-4 h-4 text-slate-400 transform transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <div className="truncate">
            <span className="font-medium text-sm text-slate-200 tracking-wide">{title}</span>
            {subtitle && (
              <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Optional Badge (e.g., for Agent Role identification) */}
        {badgeText && (
          <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase font-mono ${badgeColorClass} flex-shrink-0`}>
            {badgeText}
          </span>
        )}
      </button>

      {/* Animated Panel Content - Visible only when isExpanded is true */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100 border-t border-slate-800/80 p-4 bg-slate-950/20' : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-y-auto`}
      >
        <div className="text-sm text-slate-300 leading-relaxed font-normal">
          {children}
        </div>
      </div>
    </div>
  );
};
