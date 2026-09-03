import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MCPServer } from "./mcp-server.js";
import { PatientStore } from "./data/patient-store.js";
import { BedrockService } from "./bedrock-service.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "25mb" }));

const mcpServer = new MCPServer();
const patientStore = PatientStore.getInstance();
const bedrockService = BedrockService.getInstance();

// Connected SSE clients for real-time live telemetry stream
const sseClients: Response[] = [];

function broadcastSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(res => {
    try {
      res.write(payload);
    } catch (e) {
      // client disconnected
    }
  });
}

// 1. Health check & Diagnostics
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "vitalis-alexa-mcp-server",
    mcpSpecVersion: "2025-11-25",
    transport: "Streamable HTTP / SSE",
    toolsCount: mcpServer.getToolsList().length,
    bedrock: bedrockService.getStatus(),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 2. Streamable HTTP - SSE endpoint
app.get("/sse", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);
  console.log(`[SSE] New client connected. Active subscribers: ${sseClients.length}`);

  // Send initial handshake
  res.write(`event: connected\ndata: ${JSON.stringify({ message: "Connected to Vitalis MCP Event Stream", protocol: "2025-11-25" })}\n\n`);

  req.on("close", () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) sseClients.splice(index, 1);
    console.log(`[SSE] Client disconnected. Active subscribers: ${sseClients.length}`);
  });
});

// 3. MCP JSON-RPC 2.0 HTTP Endpoint (Streamable HTTP spec)
app.post("/mcp", async (req: Request, res: Response) => {
  const requestBody = req.body;
  const startTime = Date.now();

  broadcastSSE("mcp:request", {
    method: requestBody.method,
    id: requestBody.id,
    params: requestBody.params,
    timestamp: new Date().toISOString()
  });

  const rpcResponse = await mcpServer.handleJSONRPC(requestBody);
  const latencyMs = Date.now() - startTime;

  broadcastSSE("mcp:response", {
    method: requestBody.method,
    id: requestBody.id,
    response: rpcResponse,
    latencyMs,
    timestamp: new Date().toISOString()
  });

  res.json(rpcResponse);
});

// 4. REST Tools Catalog
app.get("/tools", (req: Request, res: Response) => {
  res.json({
    mcpSpecVersion: "2025-11-25",
    tools: mcpServer.getToolsList()
  });
});

// 5. REST Direct Tool Invocation
app.post("/tools/:toolName", async (req: Request, res: Response) => {
  const toolName = req.params.toolName as string;
  const args = req.body || {};
  try {
    const result = await mcpServer.executeTool(toolName, args);
    broadcastSSE("tool:executed", { toolName, args, result, timestamp: new Date().toISOString() });
    res.json({ success: true, tool: toolName, result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Patient Profile & Vitals API
app.get("/api/patient", (req: Request, res: Response) => {
  res.json(patientStore.getPatient());
});

// 7. Caregiver Alerts Feed API
app.get("/api/alerts", (req: Request, res: Response) => {
  res.json(patientStore.getAlerts());
});

// 8. Full Autonomous Agentic Orchestrator (Alexa+ Voice Loop)
app.post("/api/chat", async (req: Request, res: Response) => {
  const { message, patientId = "pt-88219" } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing 'message' field in body." });
  }

  const startTime = Date.now();
  const lower = message.toLowerCase();
  const toolExecutions: any[] = [];
  let spokenResponse = "";

  // Intelligent Tool Dispatch Decisioning (Alexa+ Agent Model)
  if (lower.includes("take") && (lower.includes("pill") || lower.includes("medication") || lower.includes("lisinopril") || lower.includes("metformin"))) {
    // Determine which pill
    const medId = lower.includes("metformin") ? "med-02" : "med-01";
    const logRes = await mcpServer.executeTool("log_medication_dose", {
      patientId,
      medicationId: medId,
      status: "taken",
      notes: "Confirmed via Alexa+ voice command"
    });
    toolExecutions.push({ tool: "log_medication_dose", result: logRes });
    spokenResponse = logRes.message;
  } else if (lower.includes("schedule") || lower.includes("what pills") || lower.includes("do i need to take") || lower.includes("did i take")) {
    const schedRes = await mcpServer.executeTool("check_medication_schedule", { patientId });
    toolExecutions.push({ tool: "check_medication_schedule", result: schedRes });
    spokenResponse = `You have ${schedRes.pendingDoses.length} pending medication(s) for today, Eleanor: ${schedRes.pendingDoses.map((d: any) => d.name + ' ' + d.dosage).join(', ')}. You are currently on an awesome ${schedRes.streakDays}-day streak!`;
  } else if (lower.includes("chest pain") || lower.includes("cannot breathe") || lower.includes("dizzy") || lower.includes("sick") || lower.includes("hurt") || lower.includes("ache")) {
    const triageRes = await mcpServer.executeTool("evaluate_health_symptoms", {
      patientId,
      reportedSymptoms: message,
      duration: "recent",
      severitySelfRating: lower.includes("chest pain") ? 9 : 5
    });
    toolExecutions.push({ tool: "evaluate_health_symptoms", result: triageRes });
    spokenResponse = triageRes.spokenAlexaResponse;
  } else {
    // General conversational query through Bedrock
    spokenResponse = await bedrockService.generateResponse(message);
  }

  const duration = Date.now() - startTime;

  broadcastSSE("agent:turn", {
    userMessage: message,
    spokenResponse,
    toolExecutions,
    durationMs: duration,
    timestamp: new Date().toISOString()
  });

  res.json({
    userMessage: message,
    spokenResponse,
    toolExecutions,
    patientState: patientStore.getPatient(),
    durationMs: duration,
    model: bedrockService.getStatus().modelId
  });
});


const clientDist = path.resolve(process.cwd(), "client/dist");
app.use(express.static(clientDist));

app.get("*", (req: Request, res: Response, next: any) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/mcp") || req.path.startsWith("/sse") || req.path.startsWith("/health") || req.path.startsWith("/tools")) {
    return next();
  }
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Vitalis AI - Alexa+ MCP Server running on port ${PORT}`);
  console.log(`📡 MCP JSON-RPC Streamable HTTP: http://localhost:${PORT}/mcp`);
  console.log(`📡 Server-Sent Events (SSE):     http://localhost:${PORT}/sse`);
  console.log(`🩺 Health & Diagnostics:         http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});
