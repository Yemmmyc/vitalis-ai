import test from "node:test";
import assert from "node:assert/strict";
import { MCPServer } from "../server/dist/mcp-server.js";
import { PatientStore } from "../server/dist/data/patient-store.js";

// Note: We test the compiled server code
test("MCP Server Suite", async (t) => {
  const server = new MCPServer();
  const store = PatientStore.getInstance();

  await t.test("MCP initialize handshake", async () => {
    const res = await server.handleJSONRPC({
      jsonrpc: "2.0",
      id: "init-1",
      method: "initialize",
      params: {}
    });

    assert.equal(res.result.protocolVersion, "2025-11-25");
    assert.equal(res.result.serverInfo.name, "vitalis-alexa-mcp-server");
    assert.ok(res.result.capabilities.tools);
  });

  await t.test("MCP tools/list returns registered tools", async () => {
    const res = await server.handleJSONRPC({
      jsonrpc: "2.0",
      id: "list-1",
      method: "tools/list"
    });

    const tools = res.result.tools;
    assert.ok(tools.length >= 5);
    const toolNames = tools.map(t => t.name);
    assert.ok(toolNames.includes("check_medication_schedule"));
    assert.ok(toolNames.includes("log_medication_dose"));
    assert.ok(toolNames.includes("verify_pill_bottle_vision"));
    assert.ok(toolNames.includes("evaluate_health_symptoms"));
    assert.ok(toolNames.includes("dispatch_caregiver_alert"));
  });

  await t.test("tools/call: check_medication_schedule", async () => {
    const res = await server.handleJSONRPC({
      jsonrpc: "2.0",
      id: "call-1",
      method: "tools/call",
      params: {
        name: "check_medication_schedule",
        arguments: { patientId: "pt-88219" }
      }
    });

    assert.equal(res.error, undefined);
    assert.ok(res.result.content[0].text);
    const data = JSON.parse(res.result.content[0].text);
    assert.equal(data.preferredName, "Eleanor");
    assert.ok(data.pendingDoses.length > 0);
  });

  await t.test("tools/call: verify_pill_bottle_vision (Lisinopril)", async () => {
    const res = await server.handleJSONRPC({
      jsonrpc: "2.0",
      id: "call-2",
      method: "tools/call",
      params: {
        name: "verify_pill_bottle_vision",
        arguments: {
          patientId: "pt-88219",
          samplePillPreset: "lisinopril_20mg"
        }
      }
    });

    const data = JSON.parse(res.result.content[0].text);
    assert.equal(data.detectedDrug, "Lisinopril");
    assert.equal(data.matchStatus, "VERIFIED_SAFE");
  });

  await t.test("tools/call: verify_pill_bottle_vision (Penicillin Allergy Red Flag)", async () => {
    const res = await server.handleJSONRPC({
      jsonrpc: "2.0",
      id: "call-3",
      method: "tools/call",
      params: {
        name: "verify_pill_bottle_vision",
        arguments: {
          patientId: "pt-88219",
          samplePillPreset: "penicillin_mismatch"
        }
      }
    });

    const data = JSON.parse(res.result.content[0].text);
    assert.equal(data.matchStatus, "CRITICAL_ALLERGY_ALERT");
    assert.equal(data.allergyWarning, true);
  });

  await t.test("tools/call: evaluate_health_symptoms (Chest Pain Emergency)", async () => {
    const res = await server.handleJSONRPC({
      jsonrpc: "2.0",
      id: "call-4",
      method: "tools/call",
      params: {
        name: "evaluate_health_symptoms",
        arguments: {
          patientId: "pt-88219",
          reportedSymptoms: "I am feeling pressure and tight chest pain since 10 minutes ago"
        }
      }
    });

    const data = JSON.parse(res.result.content[0].text);
    assert.equal(data.triageLevel, "EMERGENCY");
    assert.equal(data.isRedFlag, true);
    assert.equal(data.caregiverNotified, true);
  });

  await t.test("tools/call: log_medication_dose increments streak", async () => {
    const beforeStreak = store.getPatient().streakDays;
    const res = await server.handleJSONRPC({
      jsonrpc: "2.0",
      id: "call-5",
      method: "tools/call",
      params: {
        name: "log_medication_dose",
        arguments: {
          patientId: "pt-88219",
          medicationId: "med-01",
          status: "taken"
        }
      }
    });

    const data = JSON.parse(res.result.content[0].text);
    assert.equal(data.success, true);
    assert.equal(store.getPatient().streakDays, beforeStreak + 1);
  });
});
