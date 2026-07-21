/**
 * Formats a timestamp (epoch ms or ISO string) as an ISO time-of-day string,
 * e.g. `13:45:07.123`. Shared by the log and timeline views.
 */
export const formatLogTime = (timestamp: number | string): string =>
  new Date(timestamp).toISOString().split('T')[1].slice(0, -1);
