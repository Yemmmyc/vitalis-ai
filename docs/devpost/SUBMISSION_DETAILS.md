# Original Devpost Hackathon Submission: Vitalis AI

## Project Title

**Vitalis AI — AI Eldercare & Health Advocate on Alexa+**

## Elevator Pitch

Vitalis AI is an Alexa+ healthcare-assistant prototype built around a self-hosted **Model Context Protocol (MCP)** server using MCP specification `2025-11-25` and **Streamable HTTP** transport. It combines deterministic healthcare-oriented workflows with **Amazon Bedrock** for conversational responses and an Echo Show-style web simulator for an interactive demonstration.

The prototype focuses on medication routines, medication verification, symptom triage, vital summaries, and caregiver alerts. It uses a demo patient profile and simulated pill-verification and caregiver-portal workflows rather than connecting to real clinical systems or external emergency-notification services.

## Primary Track & Mini-Challenges

- **Primary Track:** Alexa+ ($25,000 1st Place)
- **Mini-Challenge 1:** AWS Builder — Amazon Bedrock integration ($5,000)
- **Mini-Challenge 2:** Open Source — qualifying open-source project/contribution ($5,000)
- **Bonus Target:** 10% Judging Bonus via Friction Logs (`docs/devpost/FRICTION_LOG.md`)

---

## Inspiration

Families caring for older adults often worry about everyday health routines: Did a medication get taken? Is a scheduled dose still pending? What happens if concerning symptoms are reported?

Traditional voice assistants are primarily reactive. Vitalis AI explores a more coordinated experience in which a conversational assistant can use structured tools to manage routine health-related workflows while keeping the interaction simple for an older adult or caregiver.

The project combines Alexa+ concepts, the open Model Context Protocol, Amazon Bedrock, and an Echo Show-style interface to demonstrate how an assistant could coordinate these workflows while maintaining clear boundaries between a hackathon simulation and real clinical infrastructure.

---

## What It Does

1. **Medication Routine Management:** Checks the demo patient's medication schedule, reports pending doses, and records medication states such as taken, skipped, or delayed.
2. **Pill Verification Simulation:** Demonstrates a predefined pill-bottle verification workflow that checks medication identity, dosage, prescription matching, expiration, and allergy-safety scenarios against the demo patient's medication profile.
3. **Model Context Protocol Integration:** Provides 6 MCP tools through the official MCP TypeScript SDK and Streamable HTTP transport using MCP specification `2025-11-25`.
4. **Symptom Triage Workflow:** Detects configured emergency red flags, assigns a severity level, records caregiver alerts, and uses Amazon Bedrock to generate an empathetic conversational response.
5. **Caregiver Portal Simulation:** Records caregiver alerts with urgency levels (`INFO`, `WARNING`, `URGENT`, `EMERGENCY`), event details, and suggested actions.
6. **Developer Telemetry:** Provides a separate SSE dashboard telemetry stream (`/sse`) for observing MCP-related activity and tool execution.

---

## How We Built It

- **Alexa+ MCP Backend:** Node.js and TypeScript implementing the Model Context Protocol with the official MCP SDK and Streamable HTTP transport (`/mcp`).
- **MCP Tools:** Six structured tools covering medication schedules, dose logging, pill-verification simulation, symptom triage, caregiver alerts, and demo vital summaries.
- **AI Core:** Amazon Bedrock (`@aws-sdk/client-bedrock-runtime`) is used for conversational responses within the symptom-triage workflow, with a local Bedrock emulator fallback for offline testing.
- **Echo Show Simulator:** React 18, Vite 6, and Tailwind CSS provide the smart-display-style web interface (`http://localhost:3000`).
- **Voice Interaction:** Web Speech API capabilities provide push-to-talk voice recognition and spoken feedback within the simulator interface.
- **Demo Data:** A local patient store provides deterministic demo medication, vital, and caregiver-alert state for repeatable testing.

---

## Challenges We Overcame

### Implementing MCP Streamable HTTP
The project evolved from a manual JSON-RPC implementation to the official `@modelcontextprotocol/sdk`. We implemented stateful Streamable HTTP sessions (`mcp-session-id`), MCP initialization, tool discovery, tool execution, and session management around the official transport.

### Keeping Safety-Oriented Logic Deterministic
Healthcare-related demonstrations need predictable behavior. The medication and symptom workflows use explicit application logic for medication states and configured emergency red flags, while Amazon Bedrock is used for the conversational response layer rather than being treated as the source of deterministic safety rules.

### Building a Useful Demo Without Real Clinical Infrastructure
The prototype needed to demonstrate the user experience without connecting to real patient records, pharmacies, emergency services, or caregiver messaging systems. We therefore separated deterministic demo data and simulations from external integrations and documented those boundaries clearly.

---

## Accomplishments We're Proud Of

- A working self-hosted MCP server using the official MCP TypeScript SDK and Streamable HTTP transport.
- MCP `2025-11-25` initialization and tool discovery verified through real HTTP requests.
- Six working MCP tools with automated regression coverage for medication behavior and time-of-day filtering.
- An Echo Show-style web simulator that demonstrates the healthcare-assistant experience without requiring physical hardware.
- Clear separation between deterministic workflow logic, simulated healthcare integrations, and the Amazon Bedrock conversational layer.
- An MIT-licensed public repository with setup instructions and automated tests.

---

## Devpost Supporting Material

- **Video Script**: [`docs/devpost/VIDEO_SCRIPT_3MIN.md`](file:///C:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/VIDEO_SCRIPT_3MIN.md)
- **Product Feedback**: [`docs/devpost/PRODUCT_FEEDBACK.md`](file:///C:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/PRODUCT_FEEDBACK.md)
- **Friction Log**: [`docs/devpost/FRICTION_LOG.md`](file:///C:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/FRICTION_LOG.md)
- **Public Repository**: [https://github.com/Yemmmyc/vitalis-ai](https://github.com/Yemmmyc/vitalis-ai)
