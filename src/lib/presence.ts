import { useEffect, useState } from "react";

export type PresenceStatus = "online" | "away" | "offline";

export function derivePresenceStatus(params: {
  status?: PresenceStatus | null;
  updatedAt?: number | null;
  now: number;
}) {
  const staleMs = 45_000;
  const { status, updatedAt, now } = params;
  if (!updatedAt) return "offline";
  if (now - updatedAt > staleMs) return "offline";
  if (status === "away" || status === "offline" || status === "online") return status;
  return "online";
}

export function useNow(intervalMs = 15_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
