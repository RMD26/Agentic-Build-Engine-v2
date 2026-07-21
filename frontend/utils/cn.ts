/**
 * Joins conditional class names into a single space-separated string,
 * dropping any falsy values. Shared across all components that build
 * Tailwind class lists dynamically.
 */
export const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ');
