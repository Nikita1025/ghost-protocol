import type { AuditEntry } from "@/shared/types";

export function mergeAudit(prev: AuditEntry[], entries: AuditEntry[]): AuditEntry[] {
  if (entries.length === 0) return prev;
  const next = [...prev];
  entries.forEach(({ type, count }) => {
    const i = next.findIndex((e) => e.type === type);
    if (i >= 0) next[i] = { ...next[i], count: next[i].count + count };
    else next.push({ type, count });
  });
  return next;
}
