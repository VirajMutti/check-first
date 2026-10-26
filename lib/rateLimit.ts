// A tiny in-memory rate limiter for /api/analyze.
//
// Each server instance remembers recent request times per visitor (by IP).
// It resets when the server restarts and isn't shared between instances —
// that's fine for a contest demo; a real launch would use a shared store.

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // per visitor per window

const hits = new Map<string, number[]>();

/** Returns true if this visitor may make another request right now. */
export function allowRequest(visitorId: string, now = Date.now()): boolean {
  // Keep only the timestamps that are still inside the window.
  const recent = (hits.get(visitorId) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(visitorId, recent);
    return false;
  }

  recent.push(now);
  hits.set(visitorId, recent);

  // Stop the map growing forever: drop the oldest visitor once it gets big.
  if (hits.size > 5000) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
  return true;
}
