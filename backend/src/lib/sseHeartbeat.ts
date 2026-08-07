/**
 * Periodic SSE comment frames so proxies/load balancers don't idle-timeout a
 * stream during long silent gaps (deep thinking + multi-round tool loops on
 * document-edit tasks can go 10s+ between writes). A line starting with ":"
 * is an SSE comment: it keeps the socket warm and every client parser here
 * already ignores lines that don't start with "data:".
 */

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const HEARTBEAT_MS = envInt("SSE_HEARTBEAT_MS", 15_000);

/** Starts the heartbeat; returns a function that stops it. Safe to call stop() more than once. */
export function startSseHeartbeat(
  write: (line: string) => void,
  intervalMs: number = HEARTBEAT_MS,
): () => void {
  const timer = setInterval(() => {
    try {
      write(": ping\n\n");
    } catch {
      /* socket already gone; the route's own close/finally handling will stop us */
    }
  }, intervalMs);
  timer.unref?.(); // never hold the process open just for a heartbeat
  return () => clearInterval(timer);
}
