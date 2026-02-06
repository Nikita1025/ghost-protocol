import { Button, Chip, Stack } from "@mui/material";

interface StreamControlsProps {
  onConnect: () => void;
  streaming: boolean;
  completed: boolean;
  error: string | null;
}

export function StreamControls({ onConnect, streaming, completed, error }: StreamControlsProps) {
  return (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        color="primary"
        onClick={onConnect}
        disabled={streaming}
        sx={{ fontFamily: "inherit" }}
      >
        {streaming ? "STREAMING..." : "CONNECT STREAM"}
      </Button>
      {error && <Chip label={error} color="error" size="small" sx={{ fontFamily: "inherit" }} />}
      {completed && (
        <Chip label="STREAM COMPLETE" color="success" size="small" sx={{ fontFamily: "inherit" }} />
      )}
    </Stack>
  );
}
