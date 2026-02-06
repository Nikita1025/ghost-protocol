import { TerminalContent } from "@/shared/ui/terminalContent";
import { Box, Paper } from "@mui/material";
import { useEffect, useRef } from "react";

interface TerminalViewProps {
  displayText: string;
  isStreaming: boolean;
  isCompleted: boolean;
  onResume?: () => void;
}

export function TerminalView({
  displayText,
  isStreaming,
  isCompleted,
  onResume,
}: TerminalViewProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming && !isCompleted) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayText, isStreaming, isCompleted]);

  return (
    <Paper
      variant="outlined"
      sx={{
        bgcolor: "#0d1117",
        border: "1px solid",
        borderColor: "primary.main",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2,
          minHeight: 320,
          maxHeight: 420,
          overflow: "auto",
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-track": { bgcolor: "#161b22" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "primary.main", borderRadius: 1 },
        }}
      >
        <TerminalContent displayText={displayText} onResume={onResume} />
        <div ref={endRef} />
      </Box>
    </Paper>
  );
}
