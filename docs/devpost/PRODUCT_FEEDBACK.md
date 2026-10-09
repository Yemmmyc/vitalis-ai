# Product Feedback: Amazon Developer Tools, Alexa+ MCP, and AWS Services

### Hackathon: Build, Ship, Shape (2026) — Devpost Submission Material

> **Prototype Notice:** Vitalis AI is a hackathon prototype demonstrating an Alexa+ healthcare-assistant concept. It operates on simulated patient data, predefined safety scenarios, and simulated caregiver workflows rather than real clinical systems or emergency dispatch services.

Below is our candid product feedback on the technologies, APIs, and SDKs utilized during the design and development of **Vitalis AI**.

---

## 1. Model Context Protocol SDK (`@modelcontextprotocol/sdk`) & Streamable HTTP

* **What we used it for**: Implementing a self-hosted MCP server matching specification `2025-11-25` using the official Streamable HTTP transport (`/mcp` endpoint) with stateful sessions. It registers 6 MCP tools: `check_medication_schedule`, `log_medication_dose`, `verify_pill_bottle_vision`, `evaluate_health_symptoms`, `dispatch_caregiver_alert`, and `get_daily_vital_summary`. A separate `/sse` endpoint provides SSE dashboard telemetry for observing MCP execution.
* **What worked well**:
  * Standardized JSON-RPC tool registration with explicit schema validation using Zod/JSON Schema.
  * Clear encapsulation of tool handlers and parameter verification.
  * Stateful session management via request headers (`mcp-session-id`) supported out of the box by the official SDK.
* **What could be improved**:
  * Documentation and examples contrasting official Streamable HTTP transport with standalone SSE event streams could be clarified.
  * Providing standardized SDK utility helpers for emitting custom telemetry events alongside the main HTTP transport lifecycle would streamline developer inspection tools.
* **Onboarding/developer experience**: Straightforward for TypeScript developers. The SDK API is well-designed once the transport protocol lifecycle is understood.
* **Would we use it again**: Yes. Standardizing AI tool execution behind open protocols improves modularity, maintainability, and testability.

---

## 2. Amazon Bedrock (`@aws-sdk/client-bedrock-runtime`)

* **What we used it for**: Providing natural-language generation for the symptom-triage workflow (`evaluate_health_symptoms`). The integration invokes Bedrock via `InvokeModelCommand`. When live AWS credentials or model access are unavailable, the application gracefully falls back to local Bedrock emulation to ensure continuous offline development.
* **What worked well**:
  * Clean, minimal request/response model with `@aws-sdk/client-bedrock-runtime`.
  * Local emulation pattern allowed consistent local testing and automated test execution without relying on active cloud connections.
* **What could be improved**:
  * Model access configuration requires manual activation of specific Anthropic models within the AWS Bedrock console prior to SDK invocation, which can cause authorization friction for new AWS accounts.
  * Console error messages for unapproved model access could be more descriptive in developer tracebacks.
* **Onboarding/developer experience**: Moderate. The Node.js SDK package is simple to install and configure, though navigating model access permissions in the AWS Console is a necessary prerequisite step.
* **Would we use it again**: Yes. Bedrock offers a reliable cloud foundation for managed model execution with local fallback mechanisms for offline testing.

---

## 3. TypeScript & Node.js (Server Architecture)

* **What we used it for**: Building the core Express backend server, MCP tool implementations, deterministic safety rules, demo patient state management, and API routes (`/mcp`, `/sse`, `/health`, `/tools/*`).
* **What worked well**:
  * Strong type safety across MCP tool input/output payloads prevented runtime schema mismatches.
  * Rapid asynchronous execution for HTTP request handling and local data mutations.
  * Excellent package compatibility with the official MCP SDK and AWS SDK.
* **What could be improved**:
  * Managing ES Module (ESM) imports alongside Node.js CommonJS dependencies requires explicit configuration in `tsconfig.json` and package files.
* **Onboarding/developer experience**: Fast and reliable. TypeScript provides confidence when modifying data structures and tool handler contracts.
* **Would we use it again**: Yes. TypeScript on Node.js is an effective choice for building MCP servers and web service prototypes.

---

## 4. React & Vite (Echo Show Web Simulator)

* **What we used it for**: Creating the smart-display web simulator interface, including the voice assistant interaction display, daily medication list, biometric vitals telemetry, caregiver alert portal modal, pill scanner modal, and developer MCP inspector drawer.
* **What worked well**:
  * Fast development server start times and instant Hot Module Replacement (HMR) via Vite.
  * Component-driven layout using React made state synchronization between MCP event streams and UI widgets simple.
* **What could be improved**:
  * Proxying Server-Sent Events (SSE) through Vite's development proxy required specific buffer configuration to prevent event stream buffering.
* **Onboarding/developer experience**: Excellent. Vite offers a smooth development environment for React applications.
* **Would we use it again**: Yes. Vite and React are our primary tools for building web display prototypes.

---

## 5. Web Speech API (Browser Speech Recognition & Synthesis)

* **What we used it for**: Enabling push-to-talk voice input (speech-to-text) and natural voice output (text-to-speech) within the Echo Show web simulator without external third-party speech services.
* **What worked well**:
  * Built directly into modern WebKit/Blink browsers with zero additional API keys or dependency overhead.
  * Configurable rate and pitch controls allowed tailoring the audio output for an elder-friendly conversational tone.
* **What could be improved**:
  * Speech recognition capabilities vary across browser engines, necessitating UI fallbacks (prompt buttons and text input) when unsupported.
* **Onboarding/developer experience**: Simple. Quick to implement with standard browser window objects.
* **Would we use it again**: Yes. It provides a lightweight, dependency-free voice interface for web display prototypes.
