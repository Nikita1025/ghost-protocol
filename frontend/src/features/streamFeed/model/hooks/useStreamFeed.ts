import { REDACTED_LABEL } from "@/shared/lib/constants";
import {
  createSanitizerState,
  flush,
  getAuditReport,
  processChunk,
  type SanitizerState,
} from "@/shared/lib/utils/sanitizer";
import type { AuditEntry, StreamState } from "@/shared/types";
import { useCallback, useRef, useState } from "react";
import type { IStreamClient } from "../types/types";
import { defaultStreamClient } from "../utils/defaultStreamClient";
import { mergeAudit } from "../utils/mergeAudit";

interface UseStreamFeedOptions {
  streamUrl?: string;
  streamClient?: IStreamClient;
}

interface UseStreamFeedResult extends StreamState {
  startStream: () => Promise<void>;
  resume: () => void;
}

export function useStreamFeed(options: UseStreamFeedOptions = {}): UseStreamFeedResult {
  const { streamUrl = "/api/stream", streamClient = defaultStreamClient } = options;

  const [displayText, setDisplayText] = useState("");
  const [auditReport, setAuditReport] = useState<AuditEntry[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sanitizerRef = useRef<SanitizerState>(createSanitizerState());
  const resumeResolverRef = useRef<(() => void) | null>(null);

  const appendDisplay = useCallback((segment: string) => {
    if (!segment) return;
    setDisplayText((prev: string) => prev + segment);
  }, []);

  const updateAudit = useCallback((entries: AuditEntry[]) => {
    setAuditReport((prev: AuditEntry[]) => mergeAudit(prev, entries));
  }, []);

  const appendDisplayWithPause = useCallback(
    async (display: string) => {
      let i = 0;
      while (i < display.length) {
        const idx = display.indexOf(REDACTED_LABEL, i);
        if (idx === -1) {
          appendDisplay(display.slice(i));
          return;
        }
        appendDisplay(display.slice(i, idx + REDACTED_LABEL.length));
        i = idx + REDACTED_LABEL.length;
        await new Promise<void>((r) => {
          resumeResolverRef.current = r;
        });
        resumeResolverRef.current = null;
      }
    },
    [appendDisplay]
  );

  const resume = useCallback(() => {
    resumeResolverRef.current?.();
    resumeResolverRef.current = null;
  }, []);

  const startStream = useCallback(async () => {
    setDisplayText("");
    setAuditReport([]);
    setCompleted(false);
    setError(null);
    sanitizerRef.current = createSanitizerState();
    setStreaming(true);

    try {
      const reader = await streamClient.getReader(streamUrl);
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (!value?.length) continue;
        const chunk = decoder.decode(value, { stream: true });
        const { output, state } = processChunk(chunk, sanitizerRef.current);
        sanitizerRef.current = state;
        await appendDisplayWithPause(output.display);
        updateAudit(output.audit);
      }
      const { display, state } = flush(sanitizerRef.current);
      sanitizerRef.current = state;
      await appendDisplayWithPause(display);
      setAuditReport(getAuditReport(sanitizerRef.current));
      setCompleted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stream failed");
    } finally {
      setStreaming(false);
    }
  }, [streamUrl, streamClient, appendDisplay, appendDisplayWithPause, updateAudit]);

  return {
    displayText,
    auditReport,
    streaming,
    completed,
    error,
    startStream,
    resume,
  };
}
