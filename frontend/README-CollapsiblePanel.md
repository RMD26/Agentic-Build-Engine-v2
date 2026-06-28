# CollapsiblePanel Improvements

The `CollapsiblePanel` component has been completely rewritten to meet production-grade standards for a VS Code-style webview environment.

## Key Architectural Upgrades

1. **CSS Grid Animation Strategy:**
   Instead of relying on hardcoded `max-height` values (which cause janky animations or clip content) or external animation libraries, the component uses a modern CSS Grid trick:
   `grid-template-rows: 0fr` transitioning to `grid-template-rows: 1fr`. 
   This ensures a buttery-smooth, hardware-accelerated open/close animation that perfectly adapts to dynamic content heights.

2. **Strict Accessibility (a11y):**
   - Implemented `useId()` to generate unique, deterministic IDs for ARIA mapping.
   - Added `aria-expanded`, `aria-controls`, and `aria-disabled` attributes.
   - The header is a native `<button>`, ensuring full keyboard navigability (Space/Enter to toggle) and proper focus management (`focus-visible:ring`).

3. **Safe State Persistence:**
   - Added a `persistKey` prop to remember the user's expanded/collapsed preference.
   - Wrapped `localStorage` access in `try/catch` blocks. This is critical for VS Code Webviews and sandboxed iframes, where accessing `localStorage` can throw synchronous DOMExceptions if storage access is restricted.

4. **Action Area & Event Propagation:**
   - Added an `actions` prop for right-aligned controls (e.g., Play, Settings, Delete buttons).
   - Implemented `e.stopPropagation()` on the actions container so interacting with buttons inside the header doesn't accidentally toggle the panel.

5. **VS Code / Developer Aesthetic:**
   - Removed generic "bubbly" UI traits.
   - Used tight padding, crisp 1px borders, muted slate backgrounds (`bg-card`, `bg-muted`), and monospace typography for subtitles to perfectly mimic the native VS Code Explorer/Panel aesthetic.
   - Added a `disabled` state that visually dims the panel and prevents interaction.
