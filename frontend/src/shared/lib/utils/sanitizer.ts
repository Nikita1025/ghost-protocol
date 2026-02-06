import { REDACTED_LABEL } from "@/shared/lib/constants";
import type { AuditEntry, ThreatType } from "@/shared/types";

interface SanitizerOutput {
  display: string;
  audit: AuditEntry[];
}

export interface SanitizerState {
  buffer: string;
  auditCounts: Record<ThreatType, number>;
}

const INITIAL_STATE: SanitizerState = {
  buffer: "",
  auditCounts: { "API Key": 0, "Credit Card": 0, "Phone Number": 0, "Banned Word": 0 },
};
const BANNED_TERMS = ["CompetitorX", "ProjectApollo", "lazy-dev"] as const;
const API_KEY_REGEX = /^sk-[a-zA-Z0-9]+/;
const CREDIT_CARD_REGEX = /^\d{4}-\d{4}-\d{4}-\d{4}(?!\d)/;
const PHONE_REGEX = /^\d{4}-\d{4}-\d{4}(?=\s|[^\d-])/;

function isDangerousChar(c: string): boolean {
  return c === "C" || c === "P" || c === "l" || c === "s" || /^\d$/.test(c);
}

function isPrefixOfBanned(buffer: string): boolean {
  return BANNED_TERMS.some((term) => term.startsWith(buffer) && buffer.length < term.length);
}

function isPrefixOfApiKey(buffer: string): boolean {
  if (!buffer.startsWith("sk")) return buffer === "s";
  if (buffer === "s" || buffer === "sk") return true;
  if (buffer.startsWith("sk-")) return /^sk-[a-zA-Z0-9]*$/.test(buffer);
  return false;
}

function isPrefixOfDigitPattern(buffer: string): boolean {
  if (!/^\d[\d-]*$/.test(buffer)) return false;
  const groups = buffer.split("-");
  const last = groups[groups.length - 1] ?? "";
  if (groups.length === 1 && last.length <= 4) return true;
  if (groups.length === 2 && last.length <= 4) return true;
  if (groups.length === 3 && last.length < 4) return true;
  if (groups.length === 3 && last.length === 4) return true;
  if (groups.length === 4 && last.length < 4) return true;
  if (groups.length === 4 && last.length === 4) return false;
  return false;
}

function isPartialPattern(buffer: string): boolean {
  if (buffer.length === 0) return false;
  const c = buffer[0];
  if (c === "C") return isPrefixOfBanned(buffer);
  if (c === "P") return isPrefixOfBanned(buffer);
  if (c === "l") return isPrefixOfBanned(buffer);
  if (c === "s") return isPrefixOfApiKey(buffer);
  if (/^\d$/.test(c)) return isPrefixOfDigitPattern(buffer);
  return false;
}

function matchFullPattern(buffer: string): { match: string; type: ThreatType } | null {
  for (const term of BANNED_TERMS) {
    if (buffer.startsWith(term)) {
      const next = buffer[term.length];
      if (next === undefined || !/[a-zA-Z0-9]/.test(next))
        return { match: term, type: "Banned Word" };
    }
  }
  const skMatch = buffer.match(API_KEY_REGEX);
  if (skMatch) return { match: skMatch[0], type: "API Key" };
  const cardMatch = buffer.match(CREDIT_CARD_REGEX);
  if (cardMatch) return { match: cardMatch[0], type: "Credit Card" };
  const phoneMatch = buffer.match(PHONE_REGEX);
  if (phoneMatch) return { match: phoneMatch[0], type: "Phone Number" };
  return null;
}

export function processChunk(
  chunk: string,
  state: SanitizerState
): { output: SanitizerOutput; state: SanitizerState } {
  let buffer = state.buffer + chunk;
  const auditCounts = { ...state.auditCounts };
  let display = "";

  while (buffer.length > 0) {
    const full = matchFullPattern(buffer);
    if (full) {
      display +=
        full.type === "Credit Card"
          ? `${REDACTED_LABEL}-${full.match.slice(-4)}`
          : REDACTED_LABEL;
      buffer = buffer.slice(full.match.length);
      auditCounts[full.type]++;
      continue;
    }
    if (!isDangerousChar(buffer[0])) {
      let safeEnd = 0;
      while (safeEnd < buffer.length && !isDangerousChar(buffer[safeEnd])) safeEnd++;
      display += buffer.slice(0, safeEnd);
      buffer = buffer.slice(safeEnd);
      continue;
    }
    if (isPartialPattern(buffer)) break;
    display += buffer[0];
    buffer = buffer.slice(1);
  }

  const auditDeltas: AuditEntry[] = [];
  (Object.entries(auditCounts) as [ThreatType, number][]).forEach(([type, count]) => {
    const prev = state.auditCounts[type];
    if (count > prev) auditDeltas.push({ type, count: count - prev });
  });

  return { output: { display, audit: auditDeltas }, state: { buffer, auditCounts } };
}

export function createSanitizerState(): SanitizerState {
  return { ...INITIAL_STATE, buffer: "", auditCounts: { ...INITIAL_STATE.auditCounts } };
}

export function flush(state: SanitizerState): { display: string; state: SanitizerState } {
  let buffer = state.buffer;
  let display = "";
  const auditCounts = { ...state.auditCounts };

  while (buffer.length > 0) {
    const full = matchFullPattern(buffer);
    if (full) {
      display +=
        full.type === "Credit Card"
          ? `${REDACTED_LABEL}-${full.match.slice(-4)}`
          : REDACTED_LABEL;
      buffer = buffer.slice(full.match.length);
      auditCounts[full.type]++;
    } else {
      display += buffer[0];
      buffer = buffer.slice(1);
    }
  }
  return { display, state: { buffer: "", auditCounts } };
}

export function getAuditReport(state: SanitizerState): AuditEntry[] {
  return (Object.entries(state.auditCounts) as [ThreatType, number][]).map(([type, count]) => ({
    type,
    count,
  }));
}
