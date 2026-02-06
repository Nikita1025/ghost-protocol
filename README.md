# GhostProtocol — Secure Terminal Interface

Secure terminal for field agents: streams intercepted intelligence in real time. **Critical:** raw data contains credentials (API keys, credit card numbers) that field agents are **not authorized** to see — a sanitization layer redacts them **in flight** before anything is painted to the screen.

---

## Launch

Run with **one command** from the root: `pnpm start` (after a one-time `pnpm install`).

**Prerequisites:** [Bun](https://bun.sh), Node.js v18+, [pnpm](https://pnpm.io).  
Install Bun if needed: `curl -fsSL https://bun.sh/install | bash` (then restart the terminal).

```bash
pnpm install && pnpm start
```

- **Backend** (Bun): intercept feed at `http://localhost:3001/stream`
- **Frontend** (Vite): terminal UI at `http://localhost:5173`

The frontend proxies `/api/stream` to the backend. Open **http://localhost:5173** and click **CONNECT STREAM**.

**Alternative (two terminals):**

```bash
# Terminal 1
cd backend && bun install && bun run start

# Terminal 2
cd frontend && pnpm install && pnpm dev
```

---

## Backend

- **Endpoint:** `GET /stream`
- **Data:** Serves a fixed `MOCK_RESPONSE` (log entries, credentials, financial records, banned terms, secure line).
- **Simulation:** Sends data in random chunks of **1–4 characters** with **10–50 ms** delay between chunks (network jitter). No full-response buffering — the client gets a live stream of small fragments.

---

## Frontend & UI

- **Stack:** React, TypeScript, Vite, MUI (Material UI).
- **Aesthetic:** Secure Terminal / Cyberpunk — dark theme, monospace font, green/amber accents.
- **Behavior:** Auto-scroll as new data arrives; typing effect. Sanitized spans appear as `[REDACTED]` or `[REDACTED]-XXXX` (cards), styled (e.g. red, glitch) so redactions are visible. Stream pauses on each redaction until the user continues (e.g. click).

---

## Sanitization

Sensitive content is replaced **before** paint. **Zero-Flicker:** the user must never see even a fragment of raw credentials (no flash of `sk-88…` then `[REDACTED]`).

| Type           | Pattern                          | Replacement          |
|----------------|----------------------------------|----------------------|
| Banned Word   | `CompetitorX`, `ProjectApollo`, `lazy-dev` (exact match, word boundary) | `[REDACTED]`         |
| API Key       | `sk-` + one or more alphanumeric (OpenAI-style) | `[REDACTED]`         |
| Credit Card   | Exactly 4 groups of 4 digits: `XXXX-XXXX-XXXX-XXXX`, no 5th digit after | `[REDACTED]-` + last 4 digits (e.g. `[REDACTED]-2233`) |
| Phone Number  | Exactly 3 groups of 4 digits: `XXXX-XXXX-XXXX` (secure line), followed by space or non-digit (so it’s not the start of a card) | `[REDACTED]`         |

- **Card vs phone:** Card = 4×4 digits; phone = 3×4 digits. Short IDs like `1022-3044` (2 groups) or `8822-1133-44` are left as-is.

**How it works:**

1. Incoming chunks are appended to a small buffer. Nothing is emitted until the pipeline decides the prefix is safe or a full sensitive pattern.
2. **Safe prefix** (e.g. spaces, most letters) → emit and advance. **Dangerous prefix** (e.g. `s` for `sk-`, digit for card/phone) → hold until a full pattern matches → emit redaction, or context shows it can’t complete → emit the now-safe prefix.
3. On each `[REDACTED]` the UI pauses the stream until the user continues; no whole-response buffering.

---

## Audit Log

When the stream ends (and in real time), the UI shows a summary of redactions:

`{ type: "API Key" | "Credit Card" | "Phone Number" | "Banned Word", count: number }`

Example for the default mock: 4 API keys, 2 credit cards, 1 phone number, 3 banned words.

---

## Layout

- **backend/** — Bun server: `GET /stream`, fragments `MOCK_RESPONSE` into 1–4 char chunks with 10–50 ms jitter.
- **frontend/** — React (TypeScript) + Vite + MUI; layered structure:
  - **app** — theme, root
  - **pages/terminal** — terminal page
  - **widgets/terminal** — terminal widget (view, controls, audit log)
  - **features/streamFeed** — `useStreamFeed`, stream client, merge audit
  - **shared** — types, `lib/sanitizer`, API, UI (layout, redacted text, terminal content, audit report)

Imports use the `@/` alias.
