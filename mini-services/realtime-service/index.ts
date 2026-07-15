/**
 * Realtime Socket.io Service
 * Sistem Informasi Keuangan MI Miftahul Ulum 01
 *
 * Listens on port 3003 (hardcoded, do NOT use env).
 *
 * - Attach socket.io with CORS open to all origins.
 * - Expose `POST /broadcast` HTTP endpoint so Next.js API routes can trigger
 *   a broadcast to all connected dashboards. Protected by a shared secret
 *   header `x-internal-secret: realtime-miftahul-2024`.
 * - Expose `GET /health` for liveness checks.
 *
 * Supported events (emitted via io.emit):
 *   - pembayaran:created   (new payment recorded)
 *   - pembayaran:updated   (payment status changed)
 *   - tagihan:created      (new tagihan generated)
 *   - tagihan:updated      (tagihan status changed, e.g. marked LUNAS)
 *   - notifikasi:new       (new notification created)
 *   - dashboard:refresh    (general refresh signal)
 *   - pengeluaran:created  (new expense recorded)
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { Server, Socket } from "socket.io";

// ----- Configuration (hardcoded per task spec) --------------------------------

const PORT = 3003;
const INTERNAL_SECRET = "realtime-miftahul-2024";

// Whitelist of events that this service is allowed to broadcast.
// Anything outside this list is rejected with HTTP 400 to prevent abuse.
const ALLOWED_EVENTS: ReadonlySet<string> = new Set<string>([
  "pembayaran:created",
  "pembayaran:updated",
  "tagihan:created",
  "tagihan:updated",
  "notifikasi:new",
  "dashboard:refresh",
  "pengeluaran:created",
]);

// ----- HTTP server -----------------------------------------------------------

const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // Always send JSON responses from this layer.
  const sendJson = (status: number, body: unknown) => {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-internal-secret",
    });
    res.end(payload);
  };

  // Handle CORS preflight.
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-internal-secret",
    });
    res.end();
    return;
  }

  // GET /health — liveness probe.
  if (req.method === "GET" && req.url === "/health") {
    sendJson(200, {
      status: "ok",
      service: "realtime-service",
      port: PORT,
      connectedClients: io.engine.clientsCount,
      uptimeSec: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // POST /broadcast — internal HTTP endpoint to fan-out an event.
  if (req.method === "POST" && req.url === "/broadcast") {
    // Validate shared secret header.
    const providedSecret = req.headers["x-internal-secret"];
    const headerOk =
      typeof providedSecret === "string"
        ? providedSecret === INTERNAL_SECRET
        : Array.isArray(providedSecret) && providedSecret.includes(INTERNAL_SECRET);

    if (!headerOk) {
      console.warn(
        `[broadcast] rejected: invalid or missing x-internal-secret from ${req.socket.remoteAddress}`
      );
      sendJson(401, { ok: false, error: "Unauthorized: invalid internal secret" });
      return;
    }

    // Parse JSON body.
    let raw = "";
    try {
      raw = await readBody(req);
    } catch (err) {
      sendJson(400, { ok: false, error: "Invalid request body" });
      return;
    }

    let parsed: { event?: unknown; payload?: unknown };
    try {
      parsed = JSON.parse(raw || "{}");
    } catch {
      sendJson(400, { ok: false, error: "Invalid JSON body" });
      return;
    }

    const event = parsed.event;
    const payload = parsed.payload ?? null;

    if (typeof event !== "string" || event.length === 0) {
      sendJson(400, { ok: false, error: "Missing or invalid `event` field" });
      return;
    }

    if (!ALLOWED_EVENTS.has(event)) {
      console.warn(`[broadcast] rejected: disallowed event "${event}"`);
      sendJson(400, {
        ok: false,
        error: `Event "${event}" is not allowed. Allowed events: ${Array.from(ALLOWED_EVENTS).join(", ")}`,
      });
      return;
    }

    // Broadcast to all connected clients.
    io.emit(event, payload);
    console.log(
      `[broadcast] event="${event}" clients=${io.engine.clientsCount} payload=${truncate(JSON.stringify(payload), 200)}`
    );

    sendJson(200, {
      ok: true,
      event,
      deliveredTo: io.engine.clientsCount,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Unknown route.
  sendJson(404, { ok: false, error: "Not found", path: req.url });
});

// ----- Socket.io server ------------------------------------------------------

const io = new Server(httpServer, {
  // Path left at default `/socket.io/` so standard socket.io clients work out
  // of the box. Caddy can still proxy this path to port 3003 if needed.
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on("connection", (socket: Socket) => {
  const clientCount = io.engine.clientsCount;
  console.log(`[io] client connected: id=${socket.id} totalConnected=${clientCount}`);

  // Let the client know it's been accepted.
  socket.emit("connected", {
    message: "Connected to MI Miftahul Ulum 01 realtime service",
    socketId: socket.id,
    timestamp: new Date().toISOString(),
  });

  // Optional heartbeat / ping handler (useful for debugging clients).
  socket.on("ping", () => {
    socket.emit("pong", { timestamp: new Date().toISOString() });
  });

  socket.on("disconnect", (reason: string) => {
    console.log(
      `[io] client disconnected: id=${socket.id} reason=${reason} totalConnected=${io.engine.clientsCount}`
    );
  });

  socket.on("error", (err: unknown) => {
    console.error(`[io] socket error id=${socket.id}:`, err);
  });
});

// ----- Helpers ---------------------------------------------------------------

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer | string) => {
      data += chunk.toString();
      // Guard against unreasonably large bodies (1MB).
      if (data.length > 1_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
        return;
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "…";
}

// ----- Start -----------------------------------------------------------------

httpServer.listen(PORT, () => {
  console.log("==================================================");
  console.log(" Realtime Service — MI Miftahul Ulum 01");
  console.log("==================================================");
  console.log(` HTTP server listening on http://0.0.0.0:${PORT}`);
  console.log(` Socket.io endpoint        ws://0.0.0.0:${PORT}/socket.io/`);
  console.log(` Health check              GET  http://localhost:${PORT}/health`);
  console.log(` Broadcast (internal)      POST http://localhost:${PORT}/broadcast`);
  console.log(`                           Header: x-internal-secret: ${INTERNAL_SECRET}`);
  console.log(` Allowed events:`);
  for (const ev of ALLOWED_EVENTS) console.log(`                            - ${ev}`);
  console.log(` Hot reload enabled (bun --hot)`);
  console.log("==================================================");
});

// ----- Graceful shutdown -----------------------------------------------------

function shutdown(signal: string) {
  console.log(`\n[shutdown] received ${signal}, closing server...`);
  io.close(() => {
    httpServer.close(() => {
      console.log("[shutdown] server closed");
      process.exit(0);
    });
  });
  // Force-exit if close hangs.
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
