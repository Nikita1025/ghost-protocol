import { Box, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        fontFamily: "JetBrains Mono, monospace",
        p: 2,
      }}
    >
      <Stack spacing={2} maxWidth={900} margin="0 auto">
        <Typography variant="h5" sx={{ color: "secondary.main", fontFamily: "inherit" }}>
          GHOST_PROTOCOL — Secure Terminal
        </Typography>
        {children}
      </Stack>
    </Box>
  );
}
