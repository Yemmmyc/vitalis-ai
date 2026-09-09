# Hackathon Submission Details: Vitalis AI

## Project Title

**Vitalis AI — AI Eldercare & Health Advocate on Alexa+**

## Elevator Pitch

Vitalis AI is an Alexa+ healthcare-assistant prototype built around a self-hosted **Model Context Protocol (MCP)** server using MCP specification `2025-11-25` and **Streamable HTTP** transport. It combines deterministic healthcare-oriented workflows with **Amazon Bedrock** for conversational responses and an Echo Show-style web simulator for an interactive demonstration.

The prototype focuses on medication routines, medication verification, symptom triage, vital summaries, and caregiver alerts. It uses a demo patient profile and simulated pill-verification and caregiver-portal workflows rather than connecting to real clinical systems or external emergency-notification services.

## Primary Track & Mini-Challenges

- **Primary Track:** Alexa+
- **Mini-Challenge 1:** AWS Builder — Amazon Bedrock integration
- **Mini-Challenge 2:** Open Source — MIT-licensed public repository

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

6. **Developer Telemetry:** Provides a separate SSE dashboard telemetry stream for observing MCP-related activity and tool execution.

---

## How We Built It

- **Alexa+ MCP Backend:** Node.js and TypeScript implementing the Model Context Protocol with the official MCP SDK and Streamable HTTP transport.
- **MCP Tools:** Six structured tools covering medication schedules, dose logging, pill-verification simulation, symptom triage, caregiver alerts, and demo vital summaries.
- **AI Core:** Amazon Bedrock is used for conversational responses within the symptom-triage workflow.
- **Echo Show Simulator:** React, Vite, and Tailwind CSS provide the smart-display-style web interface.
- **Voice Interaction:** Browser Web Speech API capabilities provide speech recognition and spoken feedback within the simulator.
- **Demo Data:** A local patient store provides deterministic demo medication, vital, and caregiver-alert state for repeatable testing.

---

## Challenges We Overcame

### Implementing MCP Streamable HTTP

The project evolved from a manual JSON-RPC implementation to the official MCP TypeScript SDK. We implemented stateful Streamable HTTP sessions, MCP initialization, tool discovery, tool execution, and GET/DELETE session handling around the official transport.

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

## What We Learned

The Model Context Protocol provides a useful way to expose structured capabilities to an AI assistant without tightly coupling the assistant to individual application interfaces.

We also learned that healthcare-oriented prototypes benefit from clearly separating deterministic workflow rules from generative conversational behavior. That separation makes demonstrations easier to test, explain, and evolve.

---

## What's Next for Vitalis AI

Future versions could connect the prototype to real-world services and standards, subject to appropriate security, privacy, consent, and clinical requirements:

- Integration with medication and pharmacy services for refill workflows.
- Optional smart-home or device integrations for additional ambient context.
- FHIR / HL7 integrations for appropriately authorized clinical data exchange.
- Production caregiver notification services with authenticated delivery and audit trails.
- Additional Alexa+ integrations and richer multimodal interactions.

---

## Prototype & Safety Notice

Vitalis AI is a **hackathon prototype and demonstration**, not a medical device or clinical decision-support system.

It uses a demo patient profile and simulated healthcare workflows. It does not replace professional medical advice, emergency services, clinical systems, or real caregiver notification infrastructure.
