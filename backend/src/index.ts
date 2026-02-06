const MOCK_RESPONSE = `[GHOST_PROTOCOL_V4]
Target: Arasaka_Tower_Subnet
Status: BREACH_SUCCESSFUL...
> 1. LOG ENTRY [2024-01-15]:
User "skyler_admin" initiated SkyNet protocol.
Confirmation ID: 1022-3044 (Note: Not a credit card).
Action: UPLOAD_GRANTED.
> 2. SCANNING CREDENTIALS...
Warning: Unencrypted keys detected!
- Root Access: sk-live-5122-3344-9988-aabb (HIGH VALUE)
- Test Scope: sk-test-4433-2211
- Malformed: sk-A1b2C3d4E5f6G7h8 (Mixed case detected)
- Too short: sk-8899 (Ignore this).
Do not share these sk-keys with unauthorized personnel.
> 3. FINANCIAL RECORDS:
- Transaction Range: 1000-2000-3000-4000
- Corporate Card: 4532-1100-8877-2233
- Backup Card: 1234-5678-9012-3456
> 4. CHATTER ANALYSIS:
- Target mentioned "CompetitorX" takeover.
- Discussing "ProjectApollo" is strictly forbidden.
- Dev team complaint: "The lazy-dev implementation is slowing us down." - Counter-argument: "lazy-loading is essential for stealth."
> 5. TERMINATING CONNECTION.
Please contact headquarters at 5555-4444-3333 (Secure Line). Session ID: 8822-1133-44.
[END_OF_STREAM]
`;

const MIN_CHUNK = 1;
const MAX_CHUNK = 4;
const MIN_DELAY_MS = 10;
const MAX_DELAY_MS = 50;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CORS_ORIGIN = "https://ghost-protocol-production-7786.up.railway.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

async function* streamFragments(text: string): AsyncGenerator<string> {
  let i = 0;
  while (i < text.length) {
    const chunkSize = randomInt(MIN_CHUNK, MAX_CHUNK);
    const end = Math.min(i + chunkSize, text.length);
    const chunk = text.slice(i, end);
    i = end;
    yield chunk;
    await delay(randomInt(MIN_DELAY_MS, MAX_DELAY_MS));
  }
}

const server = Bun.serve({
  port: 3001,
  async fetch(req: Request) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    const url = new URL(req.url);
    if (url.pathname === "/stream" && req.method === "GET") {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of streamFragments(MOCK_RESPONSE)) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });
      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`GhostProtocol intercept feed: http://localhost:${server.port}/stream`);
