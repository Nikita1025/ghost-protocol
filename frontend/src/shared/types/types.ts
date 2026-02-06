export type ThreatType = "API Key" | "Credit Card" | "Phone Number" | "Banned Word";

export interface AuditEntry {
  type: ThreatType;
  count: number;
}

export interface StreamState {
  displayText: string;
  auditReport: AuditEntry[];
  streaming: boolean;
  completed: boolean;
  error: string | null;
}
