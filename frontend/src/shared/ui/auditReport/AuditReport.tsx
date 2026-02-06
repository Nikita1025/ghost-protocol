import type { AuditEntry } from "@/shared/types";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

interface AuditReportProps {
  entries: AuditEntry[];
}

export function AuditReport({ entries }: AuditReportProps) {
  return (
    <>
      <Typography variant="subtitle2" sx={{ color: "secondary.main", fontFamily: "inherit" }}>
        AUDIT LOG — Intercepted Threats
      </Typography>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ bgcolor: "#0d1117", borderColor: "primary.dark" }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "primary.main", fontFamily: "inherit" }}>Type</TableCell>
              <TableCell align="right" sx={{ color: "primary.main", fontFamily: "inherit" }}>
                Count
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} sx={{ color: "text.secondary", fontFamily: "inherit" }}>
                  No threats intercepted yet. Connect stream to run analysis.
                </TableCell>
              </TableRow>
            )}
            {entries.map((row) => (
              <TableRow key={row.type}>
                <TableCell sx={{ fontFamily: "inherit" }}>{row.type}</TableCell>
                <TableCell align="right" sx={{ fontFamily: "inherit" }}>
                  {Math.max(0, row.count)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
