import path from "path";
import { randomUUID } from "node:crypto";
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import { MCPServer } from "./mcp-server.js";
import { PatientStore } from "./data/patient-store.js";
import { BedrockService } from "./bedrock-service.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: "25mb" }));

const mcpServer = new MCPServer();
const patientStore = PatientStore.getInstance();
const bedrockService = BedrockService.getInstance();

/**
 * Connected clients for Vitalis dashboard telemetry.
 *
 * This is separate from the MCP Streamable HTTP transport.
 */
const sseClients: Response[] = [];

function broadcastSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  sseClients.forEach((res) => {
    try {
      res.write(payload);
    } catch {
      // Client disconnected.
    }
  });
}

/**
 * MCP Streamable HTTP transports indexed by MCP session ID.
 */
const transports: Record<string, StreamableHTTPServerTransport> = {};

/**
 * Create and connect a new official MCP Streamable HTTP transport.
 */
async function createMCPTransport(): Promise<StreamableHTTPServerTransport> {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),

    onsessioninitialized: (sessionId) => {
      transports[sessionId] = transport;

      console.log(
        `[MCP] Session initialized: ${sessionId}`
      );
    },
  });

  transport.onclose = () => {
    const sessionId = transport.sessionId;

    if (sessionId && transports[sessionId]) {
      delete transports[sessionId];

      console.log(
        `[MCP] Session closed: ${sessionId}`
      );
    }
  };

  transport.onerror = (error) => {
    console.error("[MCP] Transport error:", error);
  };

  /**
   * Connect the official MCP SDK server to the official
   * Streamable HTTP transport.
   */
  const sdkServer = mcpServer.createSDKServer();

  await sdkServer.connect(transport);

  return transport;
}

/* ============================================================
   1. Health check & diagnostics
   ============================================================ */

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "vitalis-alexa-mcp-server",
    mcpSpecVersion: "2025-11-25",
    transport: "Official MCP Streamable HTTP",
    toolsCount: mcpServer.getToolsList().length,
    bedrock: bedrockService.getStatus(),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/* ============================================================
   2. Vitalis dashboard telemetry SSE
   ============================================================ */

app.get("/sse", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  sseClients.push(res);

  console.log(
    `[SSE] New dashboard client connected. Active subscribers: ${sseClients.length}`
  );

  res.write(
    `event: connected\ndata: ${JSON.stringify({
      message: "Connected to Vitalis dashboard telemetry stream",
      protocol: "2025-11-25",
    })}\n\n`
  );

  req.on("close", () => {
    const index = sseClients.indexOf(res);

    if (index !== -1) {
      sseClients.splice(index, 1);
    }

    console.log(
      `[SSE] Dashboard client disconnected. Active subscribers: ${sseClients.length}`
    );
  });
});

/* ============================================================
   3. Official MCP Streamable HTTP endpoint
   ============================================================ */

app.post("/mcp", async (req: Request, res: Response) => {
  const requestBody = req.body;
  const startTime = Date.now();

  broadcastSSE("mcp:request", {
    method: requestBody?.method,
    id: requestBody?.id,
    params: requestBody?.params,
    timestamp: new Date().toISOString(),
  });

  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    let transport: StreamableHTTPServerTransport | undefined;

    /*
     * Existing MCP session.
     */
    if (sessionId) {
      transport = transports[sessionId];

      if (!transport) {
        res.status(404).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "MCP session not found",
          },
          id: requestBody?.id ?? null,
        });

        return;
      }
    }

    /*
     * New MCP session must begin with initialize.
     */
    else if (isInitializeRequest(requestBody)) {
      transport = await createMCPTransport();
    }

    /*
     * No session and not initialization.
     */
    else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message:
            "Bad Request: MCP session ID required for this request",
        },
        id: requestBody?.id ?? null,
      });

      return;
    }

    await transport.handleRequest(req, res, requestBody);

    const latencyMs = Date.now() - startTime;

    broadcastSSE("mcp:response", {
      method: requestBody?.method,
      id: requestBody?.id,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[MCP] Request handling error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error?.message || "Internal server error",
        },
        id: requestBody?.id ?? null,
      });
    }
  }
});

/**
 * MCP Streamable HTTP GET.
 *
 * Used by the official transport for SSE streaming and
 * server-to-client messages.
 */
app.get("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId) {
    res.status(400).send("Missing MCP session ID");
    return;
  }

  const transport = transports[sessionId];

  if (!transport) {
    res.status(404).send("MCP session not found");
    return;
  }

  try {
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("[MCP] GET transport error:", error);

    if (!res.headersSent) {
      res.status(500).send("MCP stream error");
    }
  }
});

/**
 * MCP Streamable HTTP DELETE.
 *
 * Terminates an MCP session.
 */
app.delete("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId) {
    res.status(400).send("Missing MCP session ID");
    return;
  }

  const transport = transports[sessionId];

  if (!transport) {
    res.status(404).send("MCP session not found");
    return;
  }

  try {
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("[MCP] DELETE transport error:", error);

    if (!res.headersSent) {
      res.status(500).send("MCP session termination error");
    }
  }
});

/* ============================================================
   4. REST Tools Catalog
   ============================================================ */

app.get("/tools", (_req: Request, res: Response) => {
  res.json({
    mcpSpecVersion: "2025-11-25",
    tools: mcpServer.getToolsList(),
  });
});

/* ============================================================
   5. REST Direct Tool Invocation
   ============================================================ */

app.post(
  "/tools/:toolName",
  async (req: Request, res: Response) => {
    const toolName = req.params.toolName as string;
    const args = req.body || {};

    try {
      const result = await mcpServer.executeTool(toolName, args);

      broadcastSSE("tool:executed", {
        toolName,
        args,
        result,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        tool: toolName,
        result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }
);

/* ============================================================
   6. Patient Profile & Vitals API
   ============================================================ */

app.get("/api/patient", (_req: Request, res: Response) => {
  res.json(patientStore.getPatient());
});

/* ============================================================
   7. Caregiver Alerts Feed API
   ============================================================ */

app.get("/api/alerts", (_req: Request, res: Response) => {
  res.json(patientStore.getAlerts());
});

/* ============================================================
   8. Autonomous Agentic Orchestrator
   ============================================================ */

app.post("/api/chat", async (req: Request, res: Response) => {
  const {
    message,
    patientId = "pt-88219",
  } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Missing 'message' field in body.",
    });
  }

  const startTime = Date.now();
  const lower = message.toLowerCase();

  const toolExecutions: any[] = [];
  let spokenResponse = "";

  if (
    lower.includes("take") &&
    (
      lower.includes("pill") ||
      lower.includes("medication") ||
      lower.includes("lisinopril") ||
      lower.includes("metformin")
    )
  ) {
    const medId = lower.includes("metformin")
      ? "med-02"
      : "med-01";

    const logRes = await mcpServer.executeTool(
      "log_medication_dose",
      {
        patientId,
        medicationId: medId,
        status: "taken",
        notes: "Confirmed via Alexa+ voice command",
      }
    );

    toolExecutions.push({
      tool: "log_medication_dose",
      result: logRes,
    });

    spokenResponse = logRes.message;
  }

  else if (
    lower.includes("schedule") ||
    lower.includes("what pills") ||
    lower.includes("do i need to take") ||
    lower.includes("did i take")
  ) {
    const schedRes = await mcpServer.executeTool(
      "check_medication_schedule",
      { patientId }
    );

    toolExecutions.push({
      tool: "check_medication_schedule",
      result: schedRes,
    });

    spokenResponse =
      `You have ${schedRes.pendingDoses.length} pending medication(s) for today, ` +
      `Eleanor: ${schedRes.pendingDoses
        .map((d: any) => `${d.name} ${d.dosage}`)
        .join(", ")}. ` +
      `You are currently on an awesome ${schedRes.streakDays}-day streak!`;
  }

  else if (
    lower.includes("chest pain") ||
    lower.includes("cannot breathe") ||
    lower.includes("dizzy") ||
    lower.includes("sick") ||
    lower.includes("hurt") ||
    lower.includes("ache")
  ) {
    const triageRes = await mcpServer.executeTool(
      "evaluate_health_symptoms",
      {
        patientId,
        reportedSymptoms: message,
        duration: "recent",
        severitySelfRating:
          lower.includes("chest pain") ? 9 : 5,
      }
    );

    toolExecutions.push({
      tool: "evaluate_health_symptoms",
      result: triageRes,
    });

    spokenResponse = triageRes.spokenAlexaResponse;
  }

  else {
    spokenResponse =
      await bedrockService.generateResponse(message);
  }

  const duration = Date.now() - startTime;

  broadcastSSE("agent:turn", {
    userMessage: message,
    spokenResponse,
    toolExecutions,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  });

  res.json({
    userMessage: message,
    spokenResponse,
    toolExecutions,
    patientState: patientStore.getPatient(),
    durationMs: duration,
    model: bedrockService.getStatus().modelId,
  });
});

/* ============================================================
   9. Frontend
   ============================================================ */

const clientDist = path.resolve(
  process.cwd(),
  "client/dist"
);

app.use(express.static(clientDist));

app.get("*", (
  req: Request,
  res: Response,
  next: any
) => {
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/mcp") ||
    req.path.startsWith("/sse") ||
    req.path.startsWith("/health") ||
    req.path.startsWith("/tools")
  ) {
    return next();
  }

  res.sendFile(
    path.join(clientDist, "index.html")
  );
});

/* ============================================================
   10. Start server
   ============================================================ */

app.listen(PORT, () => {
  console.log(
    `=======================================================`
  );

  console.log(
    `🚀 Vitalis AI - Alexa+ MCP Server running on port ${PORT}`
  );

  console.log(
    `📡 MCP Streamable HTTP:          http://localhost:${PORT}/mcp`
  );

  console.log(
    `📡 Dashboard telemetry SSE:     http://localhost:${PORT}/sse`
  );

  console.log(
    `🩺 Health & Diagnostics:         http://localhost:${PORT}/health`
  );

  console.log(
    `=======================================================`
  );
});