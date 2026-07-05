import React, { useEffect, useId, useMemo, useState } from 'react';

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

const cn = (...classes: Array<string | false | null | undefined>) =>
 classes.filter(Boolean).join(' ');

const safeReadPersistedState = (key: string, fallback: boolean): boolean => {
 try {
  if (typeof window === 'undefined') return fallback;
  const raw = window.sessionStorage?.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
 } catch {
  return fallback;
 }
};

const safeWritePersistedState = (key: string, value: boolean) => {
 try {
  if (typeof window === 'undefined') return;
  window.sessionStorage?.setItem(key, String(value));
 } catch {
  // Ignore storage errors in restricted webviews
 }
};

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
 title,
 subtitle,
 badgeText,
 badgeColorClass = 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
 defaultExpanded = false,
 children,
 disabled = false,
 persistKey,
 onToggle,
 actions,
 contentClassName,
 className
}) => {
 const reactId = useId();
 const contentId = useMemo(
  () => `collapsible-panel-content-${reactId.replace(/:/g, '')}`,
  [reactId]
 );

 const [isExpanded, setIsExpanded] = useState<boolean>(() =>
  persistKey
   ? safeReadPersistedState(persistKey, defaultExpanded)
   : defaultExpanded
 );

 useEffect(() => {
  if (persistKey) safeWritePersistedState(persistKey, isExpanded);
  onToggle?.(isExpanded);
 }, [isExpanded, persistKey, onToggle]);

 const handleToggle = () => {
  if (disabled) return;
  setIsExpanded((prev) => !prev);
 };

 return (
  <section
   className={cn(
    'mb-3 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/40 shadow-[0_1px_2px_rgba(0,0,0,0.35)]',
    'backdrop-blur-[2px]',
    disabled && 'opacity-60',
    className
   )}
  >
   <div className="flex items-stretch">
    <button
     type="button"
     onClick={handleToggle}
     disabled={disabled}
     aria-expanded={isExpanded}
     aria-controls={contentId}
     className={cn(
      'group flex min-h-[52px] flex-1 items-center justify-between gap-3 px-3 py-3 text-left',
      'bg-slate-900/50 transition-colors duration-200',
      disabled
       ? 'cursor-not-allowed'
       : 'hover:bg-slate-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40'
     )}
    >
     <div className="flex min-w-0 items-center gap-3">
      <span
       className={cn(
        'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-slate-800 bg-slate-900/80',
        'text-slate-400 transition-colors duration-200',
        !disabled && 'group-hover:text-slate-200'
       )}
       aria-hidden="true"
      >
       <svg
        className={cn(
         'h-4 w-4 transform transition-transform duration-200 ease-out',
         isExpanded && 'rotate-90'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
       >
        <path
         strokeLinecap="round"
         strokeLinejoin="round"
         strokeWidth={2}
         d="M9 5l7 7-7 7"
        />
       </svg>
      </span>

      <div className="min-w-0">
       <div className="truncate text-sm font-semibold tracking-[0.01em] text-slate-100">
        {title}
       </div>
       {subtitle && (
        <p className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">
         {subtitle}
        </p>
       )}
      </div>
     </div>

     <div className="ml-2 flex flex-shrink-0 items-center gap-2">
      {actions && (
       <div
        className="hidden sm:flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
       >
        {actions}
       </div>
      )}

      {badgeText && (
       <span
        className={cn(
         'inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
         badgeColorClass
        )}
       >
        {badgeText}
       </span>
      )}
     </div>
    </button>
   </div>

   <div
    id={contentId}
    role="region"
    className={cn(
     'border-t border-slate-800/70 transition-[grid-template-rows,opacity] duration-200 ease-out',
     isExpanded ? 'opacity-100' : 'pointer-events-none opacity-0'
    )}
    style={{
     display: 'grid',
     gridTemplateRows: isExpanded ? '1fr' : '0fr',
    }}
   >
    <div
     className={cn(
      'overflow-hidden bg-slate-950/30 px-4 py-4 text-sm leading-relaxed text-slate-300',
      contentClassName
     )}
    >
     {children}
    </div>
   </div>
  </section>
 );
};
