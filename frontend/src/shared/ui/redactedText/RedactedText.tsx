import { useRedactedReveal } from "@/shared/lib/hooks/useRedactedReveal";
import { Typography } from "@mui/material";

interface RedactedTextProps {
  onComplete?: () => void;
}

export function RedactedText({ onComplete }: RedactedTextProps) {
  const visible = useRedactedReveal(onComplete);

  return (
    <Typography
      component="span"
      sx={{
        fontFamily: '"Courier Prime", monospace',
        color: "error.main",
        fontWeight: 600,
      }}
    >
      {visible}
    </Typography>
  );
}
