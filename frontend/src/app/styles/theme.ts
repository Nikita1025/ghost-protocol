import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00ff88" },
    secondary: { main: "#ffb300" },
    background: { default: "#0a0e14", paper: "#0d1117" },
    text: { primary: "#00ff88", secondary: "#ffb300" },
    error: { main: "#ff4444" },
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Consolas", monospace',
    body1: { fontFamily: '"JetBrains Mono", monospace' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#0a0e14" },
      },
    },
  },
});
