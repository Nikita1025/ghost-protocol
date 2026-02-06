import { REDACTED_LABEL } from "@/shared/lib/constants";
import { RedactedText } from "@/shared/ui/redactedText";
import { Typography } from "@mui/material";
import { useState } from "react";

interface TerminalContentProps {
  displayText: string;
  onResume?: () => void;
}

export function TerminalContent({ displayText, onResume }: TerminalContentProps) {
  const parts = displayText.split(REDACTED_LABEL);
  const [completedRedactions, setCompletedRedactions] = useState(0);

  return (
    <Typography
      component="pre"
      sx={{
        fontFamily: '"Courier Prime", monospace',
        fontSize: "0.9rem",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {parts.map((part, i) =>
        completedRedactions >= i ? (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <RedactedText
                onComplete={() => {
                  setCompletedRedactions((prev) => Math.max(prev, i + 1));
                  onResume?.();
                }}
              />
            )}
          </span>
        ) : null
      )}
    </Typography>
  );
}
