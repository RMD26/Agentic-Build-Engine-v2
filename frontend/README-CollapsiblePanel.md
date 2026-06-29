# CollapsiblePanel

A production-grade collapsible panel component for VS Code-style dark webview interfaces.

## Key Architectural Decisions

1. **CSS Grid Animation Strategy:**
   Instead of JS-measured `max-height` values (which require `scrollHeight` reads and cause content-clipping bugs), the component transitions `grid-template-rows` between `0fr` and `1fr`.
   This produces a buttery-smooth, hardware-accelerated open/close animation that adapts to any content height with zero JavaScript measurement.

2. **Strict Accessibility (a11y):**
   - `useId()` generates unique, deterministic IDs for ARIA mapping between the header button and content region.
   - `aria-expanded`, `aria-controls`, `aria-disabled`, and `role="region"` are set correctly.
   - The header is a native `<button>` — Space/Enter toggle works out of the box, and `focus-visible:ring` provides a crisp keyboard focus indicator.

3. **Safe State Persistence:**
   - The `persistKey` prop stores the expanded state in `sessionStorage`.
   - All storage access is wrapped in `try/catch` — critical for VS Code Webviews and sandboxed iframes where storage APIs can throw synchronous `DOMException`s.

4. **Correct `onToggle` Lifecycle:**
   - A `useRef` mount guard ensures `onToggle` is not called on the initial render, only on actual user-driven state changes.

5. **Action Area & Event Propagation:**
   - The `actions` prop renders right-aligned controls inside the header.
   - `e.stopPropagation()` on the actions container prevents clicks from toggling the panel, and actions are always visible (not hidden on mobile).

6. **VS Code / Developer Aesthetic:**
   - Tight padding, crisp 1px slate borders, muted `slate-950/40` backgrounds, and monospace uppercase subtitles mirror the native VS Code panel aesthetic.
   - `disabled` prop dims the panel with `opacity-60` and blocks interaction via `cursor-not-allowed`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Panel header title |
| `subtitle` | `string?` | — | Mono uppercase subtitle below title |
| `badgeText` | `string?` | — | Optional label badge |
| `badgeColorClass` | `string?` | cyan | Tailwind classes for badge color |
| `defaultExpanded` | `boolean?` | `false` | Initial expanded state |
| `children` | `React.ReactNode` | — | Panel body content |
| `disabled` | `boolean?` | `false` | Dims and disables toggle |
| `persistKey` | `string?` | — | `sessionStorage` key for persistence |
| `onToggle` | `(expanded: boolean) => void` | — | Callback on state change |
| `actions` | `React.ReactNode?` | — | Right-aligned header controls |
| `contentClassName` | `string?` | — | Extra classes for content area |
| `className` | `string?` | — | Extra classes for root element |

## Example Usage

```tsx
import { CollapsiblePanel } from './components/CollapsiblePanel';
import { CollapsiblePanelExample } from './components/CollapsiblePanelExample';

// Full demo with two panels (standard + disabled)
<CollapsiblePanelExample />
```
