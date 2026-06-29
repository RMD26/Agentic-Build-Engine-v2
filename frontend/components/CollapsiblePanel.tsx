import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type PanelVariant = 'default' | 'success' | 'warning' | 'danger' | 'neutral';

export interface CollapsiblePanelProps {
 title: string;
 subtitle?: string;
 badgeText?: string;
 badgeColorClass?: string;
 defaultExpanded?: boolean;
 expanded?: boolean;
 setExpanded?: (expanded: boolean) => void;
 children: React.ReactNode;
 disabled?: boolean;
 persistKey?: string;
 onToggle?: (expanded: boolean) => void;
 actions?: React.ReactNode;
 footer?: React.ReactNode;
 icon?: React.ReactNode;
 variant?: PanelVariant;
 lazyRender?: boolean;
 contentClassName?: string;
 className?: string;
 headerClassName?: string;
 useMotion?: boolean;
}

const cn = (...classes: Array<string | false | null | undefined>) =>
 classes.filter(Boolean).join(' ');

const variantStyles: Record<
 PanelVariant,
 {
  shell: string;
  badge: string;
  icon: string;
  ring: string;
 }
> = {
 default: {
  shell: 'border-slate-800/80 bg-slate-950/40',
  badge: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  icon: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  ring: 'focus-visible:ring-cyan-500/40'
 },
 success: {
  shell: 'border-emerald-900/60 bg-slate-950/40',
  badge: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  icon: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  ring: 'focus-visible:ring-emerald-500/40'
 },
 warning: {
  shell: 'border-amber-900/60 bg-slate-950/40',
  badge: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  icon: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  ring: 'focus-visible:ring-amber-500/40'
 },
 danger: {
  shell: 'border-rose-900/60 bg-slate-950/40',
  badge: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  icon: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
  ring: 'focus-visible:ring-rose-500/40'
 },
 neutral: {
  shell: 'border-slate-700/80 bg-slate-900/50',
  badge: 'bg-slate-700/60 text-slate-200 border border-slate-600/60',
  icon: 'text-slate-300 bg-slate-800 border-slate-700/70',
  ring: 'focus-visible:ring-slate-500/40'
 }
};

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
  // Ignore storage errors in restricted environments
 }
};

const useControllableExpanded = ({
 expanded,
 setExpanded,
 defaultExpanded,
 persistKey,
 onToggle
}: {
 expanded?: boolean;
 setExpanded?: (expanded: boolean) => void;
 defaultExpanded: boolean;
 persistKey?: string;
 onToggle?: (expanded: boolean) => void;
}) => {
 const [internalExpanded, setInternalExpanded] = useState<boolean>(() =>
  persistKey
   ? safeReadPersistedState(persistKey, defaultExpanded)
   : defaultExpanded
 );

 const isControlled =
  typeof expanded === 'boolean' && typeof setExpanded === 'function';
 const value = isControlled ? expanded : internalExpanded;

 const update = (next: boolean) => {
  if (isControlled) {
   setExpanded?.(next);
  } else {
   setInternalExpanded(next);
  }

  onToggle?.(next);

  if (persistKey && !isControlled) {
   safeWritePersistedState(persistKey, next);
  }
 };

 useEffect(() => {
  if (!isControlled && persistKey) {
   safeWritePersistedState(persistKey, internalExpanded);
  }
 }, [internalExpanded, isControlled, persistKey]);

 return [value, update] as const;
};

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
 title,
 subtitle,
 badgeText,
 badgeColorClass,
 defaultExpanded = false,
 expanded,
 setExpanded,
 children,
 disabled = false,
 persistKey,
 onToggle,
 actions,
 footer,
 icon,
 variant = 'default',
 lazyRender = false,
 contentClassName,
 className,
 headerClassName,
 useMotion = false
}) => {
 const styles = variantStyles[variant];
 const [isExpanded, updateExpanded] = useControllableExpanded({
  expanded,
  setExpanded,
  defaultExpanded,
  persistKey,
  onToggle
 });

 const [hasOpened, setHasOpened] = useState(defaultExpanded || !!expanded);
 const reactId = useId();
 const contentId = useMemo(
  () => `panel-content-${reactId.replace(/:/g, '')}`,
  [reactId]
 );

 const innerRef = useRef<HTMLDivElement>(null);
 const [maxHeight, setMaxHeight] = useState(0);

 useEffect(() => {
  if (isExpanded) setHasOpened(true);
 }, [isExpanded]);

 useEffect(() => {
  if (!useMotion && innerRef.current) {
   setMaxHeight(innerRef.current.scrollHeight);
  }
 }, [children, isExpanded, useMotion, footer]);

 const shouldRenderContent = !lazyRender || hasOpened || isExpanded;

 const handleToggle = () => {
  if (disabled) return;
  updateExpanded(!isExpanded);
 };

 const badgeClassName = badgeColorClass ?? styles.badge;

 return (
  <section
   className={cn(
    'mb-3 overflow-hidden rounded-lg border shadow-[0_1px_2px_rgba(0,0,0,0.35)] backdrop-blur-[2px]',
    styles.shell,
    disabled && 'opacity-60',
    className
   )}
  >
   <button
    type="button"
    onClick={handleToggle}
    disabled={disabled}
    aria-expanded={isExpanded}
    aria-controls={contentId}
    className={cn(
     'group flex min-h-[52px] w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors duration-200',
     disabled
      ? 'cursor-not-allowed bg-slate-900/50'
      : cn('bg-slate-900/50 hover:bg-slate-800/70 focus:outline-none focus-visible:ring-2', styles.ring),
     headerClassName
    )}
   >
    <div className="flex min-w-0 items-center gap-3">
     <span
      className={cn(
       'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border text-slate-300 transition-colors duration-200',
       styles.icon
      )}
      aria-hidden="true"
     >
      {icon ?? (
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
      )}
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

    <div
     className="ml-2 flex flex-shrink-0 items-center gap-2"
     onClick={(event) => event.stopPropagation()}
    >
     {actions && <div className="hidden items-center gap-2 sm:flex">{actions}</div>}
     {badgeText && (
      <span
       className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
        badgeClassName
       )}
      >
       {badgeText}
      </span>
     )}
    </div>
   </button>

   <AnimatePresence initial={false}>
    {shouldRenderContent &&
     (useMotion ? (
      <motion.div
       id={contentId}
       initial={false}
       animate={{
        height: isExpanded ? 'auto' : 0,
        opacity: isExpanded ? 1 : 0
       }}
       transition={{ duration: 0.2, ease: 'easeOut' }}
       className={cn(
        'overflow-hidden border-t border-slate-800/70',
        isExpanded ? 'pointer-events-auto' : 'pointer-events-none'
       )}
      >
       <div
        ref={innerRef}
        className={cn(
         'bg-slate-950/30 px-4 py-4 text-sm leading-relaxed text-slate-300',
         contentClassName
        )}
       >
        {children}
       </div>
       {footer && (
        <div className="border-t border-slate-800/70 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
         {footer}
        </div>
       )}
      </motion.div>
     ) : (
      <div
       id={contentId}
       className={cn(
        'overflow-hidden border-t border-slate-800/70 transition-[max-height,opacity] duration-200 ease-out',
        isExpanded ? 'opacity-100' : 'pointer-events-none opacity-0'
       )}
       style={{
        maxHeight: isExpanded ? `${maxHeight}px` : '0px'
       }}
      >
       <div
        ref={innerRef}
        className={cn(
         'bg-slate-950/30 px-4 py-4 text-sm leading-relaxed text-slate-300',
         contentClassName
        )}
       >
        {children}
       </div>
       {footer && (
        <div className="border-t border-slate-800/70 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
         {footer}
        </div>
       )}
      </div>
     ))}
   </AnimatePresence>
  </section>
 );
};
