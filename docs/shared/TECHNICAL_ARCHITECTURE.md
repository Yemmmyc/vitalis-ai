# Technical Architecture & MCP Tool Specifications: Vitalis AI

## 🏛️ System Architecture Overview

Vitalis AI is built on a decoupled, protocol-driven architecture that strictly separates generative AI conversational responses, deterministic clinical safety logic, structured Model Context Protocol (MCP) tool execution, and client user interfaces.

```mermaid
graph TD
    subgraph Client Layer
        WebSim["Echo Show Web Simulator<br/>(React 18 / Vite / Tailwind)"]
        MobileApp["Vitalis Care Android App<br/>(Capacitor 8 / OpenJDK 21)"]
        WebVoice["Browser Web Speech API<br/>(Voice Input & TTS)"]
        NativeTTS["Native Android TTS<br/>(@capacitor-community/text-to-speech)"]
    end

    subgraph Hosting & Network
        RenderPlatform["Render Web Service<br/>(Node.js / HOST: 0.0.0.0 / Dynamic PORT)"]
        LocalHost["Local Dev Environment<br/>(npm run dev / Ports 3000 & 4000)"]
    end

    subgraph Server Layer (Node.js / Express)
        ExpressServer["Express HTTP Server"]
        HealthEndpoint["/health Diagnostics"]
        SSEEndpoint["/sse Telemetry Stream"]
        MCPEndpoint["/mcp Streamable HTTP"]
    end

    subgraph Model Context Protocol (MCP)
        MCPServer["Official MCP SDK Server<br/>(Spec 2025-11-25 / @modelcontextprotocol/sdk)"]
        MCPTools["6 Registered MCP Tools"]
    end

    subgraph Data & AI Logic
        PatientStore["In-Memory PatientStore<br/>(Eleanor Vance Demo Profile)"]
        BedrockClient["AWS Bedrock Runtime SDK<br/>(@aws-sdk/client-bedrock-runtime)"]
        BedrockEmulator["Local Bedrock Emulator<br/>(Zero-Friction Dev Fallback)"]
    end

    WebSim --> WebVoice
    MobileApp --> NativeTTS
    WebSim --> ExpressServer
    MobileApp --> ExpressServer
    RenderPlatform --> ExpressServer
    LocalHost --> ExpressServer

    ExpressServer --> HealthEndpoint
    ExpressServer --> SSEEndpoint
    ExpressServer --> MCPEndpoint
    MCPEndpoint --> MCPServer
    MCPServer --> MCPTools

    MCPTools --> PatientStore
    ExpressServer --> BedrockClient
    ExpressServer --> BedrockEmulator
```

---

## ⚡ Deployment & Operational Architecture

The application is deployed as a live cloud service on **Render** and can also be run locally:

| Property | Cloud Deployment (Render) | Local Development |
| :--- | :--- | :--- |
| **Service URL** | `https://vitalis-ai-wtdy.onrender.com/` | `http://localhost:3000/` (Client) / `http://localhost:4000/` (Server) |
| **Health Check** | `https://vitalis-ai-wtdy.onrender.com/health` | `http://localhost:4000/health` |
| **MCP Endpoint** | `https://vitalis-ai-wtdy.onrender.com/mcp` | `http://localhost:4000/mcp` |
| **SSE Telemetry** | `https://vitalis-ai-wtdy.onrender.com/sse` | `http://localhost:4000/sse` |
| **Process Binding** | `process.env.PORT`, `process.env.HOST` (`0.0.0.0`) | `PORT=4000`, `HOST=0.0.0.0` |
| **Static Assets** | Express serves compiled `client/dist` bundle | Vite development server with HMR |

---

## 🧩 Component Responsibilities

### 1. Frontend Web Simulator (Client)
- **Technology**: React 18, Vite 6, TypeScript, Tailwind CSS, Lucide React Icons.
- **Role**: Emulates the 10-inch Echo Show smart display layout. Provides touch-driven interaction, time-of-day medication cards, adherence streak counters, live vital displays, and modal drawers for pill scanning, caregiver alerts, and the MCP Inspector.
- **Voice**: Implements push-to-talk speech recognition and synthesis using the browser's native Web Speech API.

### 2. Mobile Companion App (**Vitalis Care**)
- **Technology**: Capacitor 8 (`@capacitor/core`, `@capacitor/android`), OpenJDK 21, Gradle.
- **Package ID & Label**: `com.vitalis.app` / `Vitalis Care`.
- **Role**: Native Android application wrapper optimized for mobile display viewports (verified on physical Tecno Spark 20).
- **Native Audio**: Utilizes `@capacitor-community/text-to-speech` for reliable hardware audio playback.

### 3. Server & Network Gateway
- **Technology**: Node.js, Express, TypeScript.
- **Role**: Serves compiled frontend assets, exposes RESTful diagnostics (`/health`), manages Server-Sent Events telemetry subscriptions (`/sse`), and routes JSON-RPC 2.0 messages over Streamable HTTP (`/mcp`).

### 4. Model Context Protocol (MCP) Server
- **Specification**: `2025-11-25`.
- **SDK**: Official `@modelcontextprotocol/sdk` (v1.0.4).
- **Transport**: `StreamableHTTPServerTransport` handling stateful HTTP sessions via `mcp-session-id` headers.
- **Role**: Exposes 6 registered tools converted from JSON Schema to Zod shapes for schema validation and tool discovery.

### 5. Telemetry & Developer Observability
- **SSE Stream (`/sse`)**: Broadcasts connected events, MCP requests (`mcp:request`), MCP responses with latency benchmarks (`mcp:response`), and conversational agent turns (`agent:turn`).

---

## 🛠️ Registered MCP Tool Specifications

The MCP server registers exactly 6 tools:

| Tool Name | Parameters | Responsibility & State Transformation |
| :--- | :--- | :--- |
| `check_medication_schedule` | `patientId` (string), `timeOfDay` (optional enum: `morning`, `afternoon`, `evening`, `bedtime`, `all`) | Queries `PatientStore` for scheduled medications, filters pending doses by time-of-day category, and calculates adherence percentage and streak length. |
| `log_medication_dose` | `patientId` (string), `medicationId` (string), `status` (enum: `taken`, `skipped`, `delayed`) | Updates medication record. Logging `taken` increments the adherence streak; `skipped` or `delayed` updates status without false streak padding. |
| `verify_pill_bottle_vision` | `patientId` (string), `samplePillPreset` (string enum: `lisinopril_20mg`, `metformin_500mg`, `atorvastatin_40mg`, `penicillin_mismatch`, `expired_aspirin`), `imageBase64` (optional string) | Evaluates a pill verification scenario against the patient record, validating drug identity, dosage, expiration date, prescription match, and allergy safety rules (e.g., penicillin allergy conflict). |
| `evaluate_health_symptoms` | `patientId` (string), `reportedSymptoms` (string), `duration` (optional string), `severitySelfRating` (optional number) | Evaluates symptoms against deterministic clinical red-flag rules (e.g., chest pain, shortness of breath), assigns triage severity (`EMERGENCY`, `URGENT`, `ROUTINE`), records caregiver alerts, and returns conversational response text. |
| `dispatch_caregiver_alert` | `patientId` (string), `urgency` (enum: `INFO`, `WARNING`, `URGENT`, `EMERGENCY`), `title` (string), `message` (string), `suggestedAction` (optional string) | Dispatches an alert into the simulated caregiver portal, assigning a unique UUID, timestamp, and read status for caregiver review. |
| `get_daily_vital_summary` | `patientId` (string) | Returns latest physiological metrics (blood pressure, heart rate, blood glucose, hydration, sleep) with status evaluations (`normal`, `warning`, `critical`). |

---

## 🤖 AI / LLM Layer & Amazon Bedrock Status

The AI layer is encapsulated in `BedrockService` (`server/src/bedrock-service.ts`):

### 1. Live AWS Bedrock Client Integration
- Configured via `@aws-sdk/client-bedrock-runtime` using `InvokeModelCommand`.
- Target Foundation Model: `anthropic.claude-3-5-sonnet-20241022-v2:0` (or AWS Nova models via `BEDROCK_MODEL_ID`).
- Region: `us-east-1` (configurable via `AWS_REGION`).

### 2. Deployed Status Disclosure
In the live Render cloud deployment:
- `bedrock.configured`: `false`
- `bedrock.mode`: `"Local Intelligent Bedrock Emulation (Zero-Friction Dev)"`
- **Distinction**: Although the server reports model ID `anthropic.claude-3-5-sonnet-20241022-v2:0`, **no live Bedrock API invocations are being executed**. AWS credentials are not provisioned in the Render deployment environment.
- **Emulation Behavior**: The service provides deterministic clinical fallback responses that emulate Claude 3.5 Sonnet's conversational tone, ensuring zero latency and predictable testing without AWS credentials.

---

## 🔒 Scope Boundaries: Implemented vs. Simulated vs. Future Work

| Subsystem | Implemented & Verified | Simulated Workflows | Future Work |
| :--- | :--- | :--- | :--- |
| **Model Context Protocol** | Full Streamable HTTP spec `2025-11-25`, session handling, 6 tools | None | Additional clinical tool schemas |
| **Cloud Deployment** | Render Web Service, Express static serving, dynamic port binding | Potential cloud container cold starts (idle spin-down) | Multi-region production deployment |
| **State Management** | In-memory `PatientStore` with real state mutation and streak tracking | State resets on server restart / redeploy | PostgreSQL / DynamoDB HIPAA-compliant persistence |
| **Amazon Bedrock AI** | Bedrock SDK integration and intelligent local fallback emulation | Deployed service runs local emulation; no live AWS calls | Live AWS IAM credentials and Bedrock model access grant |
| **Pill Verification** | Safety verification logic & allergy conflict algorithms | Image recognition simulated via test presets | Live camera OCR via AWS Rekognition / Bedrock multimodal |
| **Caregiver Alerts** | Real-time in-memory alert logging and UI portal rendering | Alert delivery is internal; no external SMS/call networks | Live SMS / WhatsApp / Webhook alerts via AWS SNS / Twilio |
| **Voice & Smart Display** | Interactive Echo Show web simulator & Android Capacitor app | Browser Web Speech API & native Android TTS | Published Alexa Skill Store custom voice skill |
| **Mobile Companion** | Native Android APK with OpenJDK 21, physical device tested | None | Google Play Store publication |
