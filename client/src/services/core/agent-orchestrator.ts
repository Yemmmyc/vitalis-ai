import { ChatResponse } from '../IVitalisService';
import { executeMCPTool } from './tools';
import { BedrockEmulator } from './bedrock-emulator';
import { TelemetryBus } from './telemetry-bus';
import { InAppPatientStore } from './patient-store';

export async function processAgentChat(
  message: string,
  patientId: string = "pt-88219"
): Promise<ChatResponse> {
  const startTime = Date.now();
  const telemetry = TelemetryBus.getInstance();
  const store = InAppPatientStore.getInstance();
  const bedrock = BedrockEmulator.getInstance();

  const lower = message.toLowerCase();
  const toolExecutions: any[] = [];
  let spokenResponse = "";

  telemetry.emit({
    type: 'request',
    method: 'agent:turn',
    payload: { userMessage: message, patientId, timestamp: new Date().toISOString() }
  });

  if (
    !lower.includes("what pills") &&
    !lower.includes("do i need to take") &&
    !lower.includes("schedule") &&
    !lower.includes("did i take") &&
    (lower.includes("take") || lower.includes("took") || lower.includes("taken")) &&
    (
      lower.includes("pill") ||
      lower.includes("medication") ||
      lower.includes("lisinopril") ||
      lower.includes("metformin")
    )
  ) {
    const medId = lower.includes("metformin") ? "med-02" : "med-01";
    const args = {
      patientId,
      medicationId: medId,
      status: "taken",
      notes: "Confirmed via in-app interface"
    };

    telemetry.emit({
      type: 'request',
      method: 'tools/call',
      payload: { name: 'log_medication_dose', arguments: args }
    });

    const logRes = await executeMCPTool('log_medication_dose', args);

    toolExecutions.push({
      tool: "log_medication_dose",
      result: logRes
    });

    telemetry.emit({
      type: 'response',
      method: 'Tool Executed: log_medication_dose',
      payload: { toolName: 'log_medication_dose', args, result: logRes }
    });

    spokenResponse = logRes.message;
  } else if (
    lower.includes("schedule") ||
    lower.includes("what pills") ||
    lower.includes("do i need to take") ||
    lower.includes("did i take")
  ) {
    const args = { patientId };

    telemetry.emit({
      type: 'request',
      method: 'tools/call',
      payload: { name: 'check_medication_schedule', arguments: args }
    });

    const schedRes = await executeMCPTool('check_medication_schedule', args);

    toolExecutions.push({
      tool: "check_medication_schedule",
      result: schedRes
    });

    telemetry.emit({
      type: 'response',
      method: 'Tool Executed: check_medication_schedule',
      payload: { toolName: 'check_medication_schedule', args, result: schedRes }
    });

    spokenResponse =
      `You have ${schedRes.pendingDoses.length} pending medication(s) for today, ` +
      `Eleanor: ${schedRes.pendingDoses
        .map((d: any) => `${d.name} ${d.dosage}`)
        .join(", ")}. ` +
      `You are currently on an awesome ${schedRes.streakDays}-day streak!`;
  } else if (
    lower.includes("chest pain") ||
    lower.includes("cannot breathe") ||
    lower.includes("dizzy") ||
    lower.includes("sick") ||
    lower.includes("hurt") ||
    lower.includes("ache")
  ) {
    const args = {
      patientId,
      reportedSymptoms: message,
      duration: "recent",
      severitySelfRating: lower.includes("chest pain") ? 9 : 5
    };

    telemetry.emit({
      type: 'request',
      method: 'tools/call',
      payload: { name: 'evaluate_health_symptoms', arguments: args }
    });

    const triageRes = await executeMCPTool('evaluate_health_symptoms', args);

    toolExecutions.push({
      tool: "evaluate_health_symptoms",
      result: triageRes
    });

    telemetry.emit({
      type: 'response',
      method: 'Tool Executed: evaluate_health_symptoms',
      payload: { toolName: 'evaluate_health_symptoms', args, result: triageRes }
    });

    spokenResponse = triageRes.spokenAlexaResponse;
  } else {
    spokenResponse = await bedrock.generateResponse(message);
  }

  const durationMs = Date.now() - startTime;

  telemetry.emit({
    type: 'response',
    method: 'agent:turn',
    latencyMs: durationMs,
    payload: {
      userMessage: message,
      spokenResponse,
      toolExecutions,
      durationMs
    }
  });

  return {
    userMessage: message,
    spokenResponse,
    toolExecutions,
    patientState: JSON.parse(JSON.stringify(store.getPatient())),
    durationMs,
    model: bedrock.getStatus().modelId
  };
}
