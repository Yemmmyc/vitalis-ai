# Original Devpost Hackathon Submission: Vitalis AI

## Project Title

**Vitalis AI — AI Eldercare & Health Advocate on Alexa+**

## Elevator Pitch

Vitalis AI is an Alexa+ healthcare-assistant prototype and full-stack web simulator built around a self-hosted **Model Context Protocol (MCP)** server using MCP specification `2025-11-25` and **Streamable HTTP** transport. Deployed live on Render and powered by **Amazon Bedrock** architecture, it combines deterministic healthcare workflows with an interactive Echo Show-style web simulator.

The prototype focuses on medication routine management, visual pill-bottle verification, symptom triage with emergency red-flag detection, daily vital monitoring, and caregiver alerts. It uses a demo patient profile and simulated pill-verification and caregiver-portal workflows rather than connecting to real clinical EHR systems or external cellular emergency-notification networks.

## Primary Track & Mini-Challenges

- **Primary Track:** Alexa+ ($25,000 1st Place)
- **Mini-Challenge 1:** AWS Builder — Amazon Bedrock integration ($5,000)
- **Mini-Challenge 2:** Open Source — qualifying open-source project/contribution ($5,000)
- **Bonus Target:** 10% Judging Bonus via Friction Logs (`docs/devpost/FRICTION_LOG.md`)

---

## 🌐 Public Demo & Verified Deployment Endpoints

| Resource | URL | Details |
| :--- | :--- | :--- |
| **Public Web Application** | [https://vitalis-ai-wtdy.onrender.com/](https://vitalis-ai-wtdy.onrender.com/) | Live Echo Show smart display web simulator |
| **Health Check & Diagnostics** | [https://vitalis-ai-wtdy.onrender.com/health](https://vitalis-ai-wtdy.onrender.com/health) | Reports status `healthy`, 6 MCP tools, MCP spec `2025-11-25` |
| **MCP Streamable HTTP** | [https://vitalis-ai-wtdy.onrender.com/mcp](https://vitalis-ai-wtdy.onrender.com/mcp) | Official MCP Streamable HTTP endpoint |
| **Dashboard Telemetry SSE** | [https://vitalis-ai-wtdy.onrender.com/sse](https://vitalis-ai-wtdy.onrender.com/sse) | Real-time Server-Sent Events telemetry |
| **Source Repository** | [https://github.com/Yemmmyc/vitalis-ai](https://github.com/Yemmmyc/vitalis-ai) | MIT-licensed open-source repository |
| **Deployed Source Commit** | `3a37ca41b0cc41ac5c65ab00ef712c19f8098013` | Render Web Service deployment commit |

> **Bedrock Deployment Disclosure**: The live health endpoint reports `bedrock.configured: false` and `bedrock.mode: "Local Intelligent Bedrock Emulation (Zero-Friction Dev)"`. The reported model ID `anthropic.claude-3-5-sonnet-20241022-v2:0` reflects the target foundation model configured in the source code, but the deployed service does not make live AWS Bedrock API calls because AWS credentials are not provisioned in the Render environment. Real Bedrock integration is fully implemented in the codebase via `@aws-sdk/client-bedrock-runtime` and activates upon configuring valid AWS credentials.

---

## Inspiration

Families caring for older adults often worry about everyday health routines: Did a medication get taken? Is a scheduled dose still pending? What happens if concerning symptoms are reported?

Traditional voice assistants are primarily reactive. Vitalis AI explores a more coordinated experience in which a conversational assistant can use structured tools to manage routine health-related workflows while keeping the interaction simple for an older adult or caregiver.

The project combines Alexa+ concepts, the open Model Context Protocol, Amazon Bedrock, and an Echo Show-style interface to demonstrate how an assistant could coordinate these workflows while maintaining clear boundaries between a hackathon simulation and real clinical infrastructure.

---

## What It Does

1. **Medication Routine Management:** Checks the demo patient's medication schedule, reports pending doses, and records medication states such as taken, skipped, or delayed.
2. **Pill Verification Simulation:** Demonstrates a predefined pill-bottle verification workflow that checks medication identity, dosage, prescription matching, expiration, and allergy-safety scenarios against the demo patient's medication profile.
3. **Model Context Protocol Integration:** Exposes 6 production-ready MCP tools through the official MCP TypeScript SDK and Streamable HTTP transport matching MCP specification `2025-11-25`.
4. **Symptom Triage Workflow:** Detects configured emergency red flags, assigns a severity level, records caregiver alerts, and uses Amazon Bedrock architecture (with local emulation fallback) to generate an empathetic conversational response.
5. **Caregiver Portal Simulation:** Records caregiver alerts with urgency levels (`INFO`, `WARNING`, `URGENT`, `EMERGENCY`), event details, and suggested actions for family caregiver oversight.
6. **Developer Telemetry:** Provides a separate SSE dashboard telemetry stream (`/sse`) for observing real-time MCP tool executions and latency metrics.

---

## How We Built It

- **Alexa+ MCP Backend:** Node.js and TypeScript implementing the Model Context Protocol with the official MCP SDK and Streamable HTTP transport (`/mcp`).
- **Cloud Deployment:** Deployed to a live Render Web Service listening on `process.env.PORT` and `0.0.0.0`, with build command `npm ci && npm ci --prefix client && npm run build` and start command `npm start`.
- **MCP Tools:** Six structured tools covering medication schedules, dose logging, pill-verification simulation, symptom triage, caregiver alerts, and demo vital summaries.
- **AI Core:** Amazon Bedrock integration (`@aws-sdk/client-bedrock-runtime`) for conversational responses, backed by an intelligent local emulator that mirrors Claude 3.5 Sonnet responses when AWS credentials are not configured.
- **Echo Show Simulator:** React 18, Vite 6, and Tailwind CSS provide the smart-display-style web interface (`https://vitalis-ai-wtdy.onrender.com/`).
- **Voice Interaction:** Browser Web Speech API capabilities provide push-to-talk voice recognition and spoken feedback within the simulator interface. (Does not claim native Alexa hardware integration).
- **Demo Data:** A local in-memory patient store provides deterministic demo medication, vital, and caregiver-alert state for repeatable testing without PHI liability.

---

## Challenges We Overcame

### Implementing Official MCP Streamable HTTP
The project evolved from a custom JSON-RPC implementation to the official `@modelcontextprotocol/sdk`. We implemented stateful Streamable HTTP sessions (`mcp-session-id`), MCP initialization, tool discovery, tool execution, and session management around the official transport.

### Keeping Safety-Oriented Logic Deterministic
Healthcare-related demonstrations need predictable behavior. The medication and symptom workflows use explicit application logic for medication states and configured emergency red flags, while Amazon Bedrock is used for the conversational response layer rather than being treated as the source of deterministic safety rules.

### Building a Useful Demo Without Real Clinical Infrastructure
The prototype needed to demonstrate the user experience without connecting to real patient records, pharmacies, emergency services, or caregiver messaging systems. We therefore separated deterministic demo data and simulations from external integrations and documented those boundaries clearly.

---

## Accomplishments We're Proud Of

- A live, publicly accessible deployment on Render Web Service serving both the web simulator and MCP endpoints.
- A working self-hosted MCP server using the official MCP TypeScript SDK and Streamable HTTP transport matching specification `2025-11-25`.
- MCP `2025-11-25` initialization and tool discovery verified through real HTTP requests.
- Six working MCP tools with automated regression coverage for medication behavior and time-of-day filtering (13 / 13 tests passing).
- An Echo Show-style web simulator that demonstrates the healthcare-assistant experience without requiring physical hardware.
- Clear separation between deterministic workflow logic, simulated healthcare integrations, and the Amazon Bedrock conversational layer.
- An MIT-licensed public repository with setup instructions and automated tests.

---

## Devpost Supporting Material

- **Live Application Demo**: [https://vitalis-ai-wtdy.onrender.com/](https://vitalis-ai-wtdy.onrender.com/)
- **Live Health Diagnostics**: [https://vitalis-ai-wtdy.onrender.com/health](https://vitalis-ai-wtdy.onrender.com/health)
- **Public Repository**: [https://github.com/Yemmmyc/vitalis-ai](https://github.com/Yemmmyc/vitalis-ai)
- **Video Script**: [`docs/devpost/VIDEO_SCRIPT_3MIN.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/VIDEO_SCRIPT_3MIN.md)
- **Product Feedback**: [`docs/devpost/PRODUCT_FEEDBACK.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/PRODUCT_FEEDBACK.md)
- **Friction Log**: [`docs/devpost/FRICTION_LOG.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/FRICTION_LOG.md)
- **Deployment Documentation**: [`docs/deployment/RENDER_DEPLOYMENT.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/deployment/RENDER_DEPLOYMENT.md)
