import { Layout } from "@/shared/ui/layout";
import { AuditReport } from "@/shared/ui/auditReport";
import { useStreamFeed, StreamControls } from "@/features/streamFeed";
import { TerminalView } from "./TerminalView";

export function TerminalWidget() {
  const { displayText, auditReport, streaming, completed, error, startStream, resume } =
    useStreamFeed({ streamUrl: "/api/stream" });

  return (
    <Layout>
      <TerminalView
          displayText={displayText}
          isStreaming={streaming}
          isCompleted={completed}
          onResume={resume}
        />
      <StreamControls
        onConnect={startStream}
        streaming={streaming}
        completed={completed}
        error={error}
      />
      <AuditReport entries={auditReport} />
    </Layout>
  );
}
