# Render Web Service Deployment Guide: Vitalis AI

This document provides verified operational instructions and deployment details for the **Vitalis AI** full-stack web application and Model Context Protocol (MCP) server deployed on Render.

---

## 🌐 Confirmed Live Deployment Details

| Property | Verified Value |
| :--- | :--- |
| **Project Name** | Vitalis AI — AI eldercare and health advocate |
| **Hosting Platform** | Render Web Service |
| **Public Web Application** | [https://vitalis-ai-wtdy.onrender.com/](https://vitalis-ai-wtdy.onrender.com/) |
| **Health & Diagnostics Endpoint** | [https://vitalis-ai-wtdy.onrender.com/health](https://vitalis-ai-wtdy.onrender.com/health) |
| **MCP Streamable HTTP Endpoint** | [https://vitalis-ai-wtdy.onrender.com/mcp](https://vitalis-ai-wtdy.onrender.com/mcp) |
| **Dashboard Telemetry SSE Endpoint** | [https://vitalis-ai-wtdy.onrender.com/sse](https://vitalis-ai-wtdy.onrender.com/sse) |
| **Source Repository** | [https://github.com/Yemmmyc/vitalis-ai](https://github.com/Yemmmyc/vitalis-ai) |
| **Deployed Source Commit** | `3a37ca41b0cc41ac5c65ab00ef712c19f8098013` (`3a37ca4`) |
| **Deployment Build Command** | `npm ci && npm ci --prefix client && npm run build` |
| **Deployment Start Command** | `npm start` |
| **Health-Check Path** | `/health` |

---

## 🩺 Verified Health Check Response

A GET request to `https://vitalis-ai-wtdy.onrender.com/health` returns healthy JSON diagnostics:

```json
{
  "status": "healthy",
  "service": "vitalis-alexa-mcp-server",
  "mcpSpecVersion": "2025-11-25",
  "transport": "Official MCP Streamable HTTP",
  "toolsCount": 6,
  "bedrock": {
    "configured": false,
    "region": "us-east-1",
    "modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0",
    "mode": "Local Intelligent Bedrock Emulation (Zero-Friction Dev)"
  },
  "uptimeSeconds": 124,
  "timestamp": "2026-10-14T08:50:00.000Z"
}
```

### Verified Diagnostic Fields:
- **`status`**: `"healthy"`
- **`toolsCount`**: `6` registered MCP tools (`check_medication_schedule`, `log_medication_dose`, `verify_pill_bottle_vision`, `evaluate_health_symptoms`, `dispatch_caregiver_alert`, `get_daily_vital_summary`)
- **`mcpSpecVersion`**: `"2025-11-25"`
- **`transport`**: `"Official MCP Streamable HTTP"`

---

## ⚠️ Important Amazon Bedrock Disclosure

The live health endpoint reports:
- `bedrock.configured`: `false`
- `bedrock.mode`: `"Local Intelligent Bedrock Emulation (Zero-Friction Dev)"`
- `bedrock.modelId`: `"anthropic.claude-3-5-sonnet-20241022-v2:0"`

> [!IMPORTANT]
> **Emulation Disclosure**: The presence of the model ID string (`anthropic.claude-3-5-sonnet-20241022-v2:0`) indicates the configured target Bedrock model name in the source code; **it does NOT mean that live Bedrock API calls are being made**.
> 
> Because AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are not configured in the deployed Render environment, the application operates in **Local Intelligent Bedrock Emulation** mode. In this mode, the server uses deterministic clinical responses that mirror Claude 3.5 Sonnet's voice without making external AWS network calls.
> 
> Connecting to live Amazon Bedrock runtime inference requires provisioning AWS credentials with active Bedrock model access in Render environment variables. This remains optional future work.

---

## ⚙️ Render Service Configuration

The Render Web Service is configured with the following parameters:

### 1. Source & Repository Settings
- **Repository**: `https://github.com/Yemmmyc/vitalis-ai`
- **Branch**: `main`
- **Root Directory**: `./` (Root of the repository)
- **Environment**: `Node`

### 2. Build & Launch Commands
- **Build Command**:
  ```bash
  npm ci && npm ci --prefix client && npm run build
  ```
  *Explanation*: This installs clean dependencies for the root server project and the client frontend sub-package, compiles the TypeScript server (`server/dist`), and compiles the Vite React web application (`client/dist`).
- **Start Command**:
  ```bash
  npm start
  ```
  *Explanation*: Maps to `"node server/dist/index.js"` as configured in the root `package.json`.
- **Health Check Path**: `/health`

### 3. Server Networking & Port Binding
The server source code (`server/src/index.ts`) binds dynamically:
```typescript
const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || "0.0.0.0";
```
- **`PORT`**: Render injects `process.env.PORT` dynamically at container startup.
- **`HOST`**: Defaults to `0.0.0.0`, allowing the web service to accept incoming external traffic through Render's reverse proxy.

### 4. Verified Environment Variables
Only variables established from repository source inspection are recognized:

| Variable | Required | Default in Code | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | Managed by Render | `4000` | HTTP port on which the Express server listens |
| `HOST` | Optional | `0.0.0.0` | Network interface binding |
| `AWS_REGION` | Optional | `us-east-1` | AWS Region for Amazon Bedrock runtime client |
| `AWS_ACCESS_KEY_ID` | Optional | *(None)* | AWS Access Key ID for Bedrock invocation |
| `AWS_SECRET_ACCESS_KEY`| Optional | *(None)* | AWS Secret Access Key for Bedrock invocation |
| `BEDROCK_MODEL_ID` | Optional | `anthropic.claude-3-5-sonnet-20241022-v2:0` | Target Bedrock Foundation Model ID |

> [!NOTE]
> Do not add fabricated environment variables. When `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are omitted, the server automatically defaults to intelligent local emulation.

---

## 🔍 How to Inspect Render Logs

### Build Logs
1. Navigate to the **Render Dashboard** ([dashboard.render.com](https://dashboard.render.com)).
2. Select the `vitalis-ai-wtdy` service.
3. In the left navigation, click **Events** or click the latest deployment entry under **Deploy History**.
4. Review the build steps:
   - Node environment setup
   - Root dependency installation (`npm ci`)
   - Client dependency installation (`npm ci --prefix client`)
   - TypeScript server compilation (`tsc -p server/tsconfig.json`)
   - Vite client production build (`vite build` -> `client/dist`)
   - Successful build completion message

### Runtime Logs
1. In the service navigation, click **Logs**.
2. Look for the application startup banner emitted by `server/src/index.ts`:
   ```text
   =======================================================
   🚀 Vitalis AI - Alexa+ MCP Server running on port 10000
   📡 MCP Streamable HTTP:          http://localhost:10000/mcp
   📡 Dashboard telemetry SSE:     http://localhost:10000/sse
   🩺 Health & Diagnostics:         http://localhost:10000/health
   =======================================================
   ```
3. Runtime logs will also display incoming MCP session creations (`[MCP] Session initialized: <uuid>`), telemetry broadcasts, and SSE client connections.

---

## 🔄 Redeployment & Verification Procedure

### Redeployment Steps
1. Push new commits to the `main` branch of `https://github.com/Yemmmyc/vitalis-ai`.
2. Render will automatically initiate a build if Auto-Deploy is enabled. Alternatively, click **Manual Deploy** > **Deploy latest commit** in the Render Dashboard.
3. Monitor build logs until the status transitions to **Live**.

### Post-Deployment Verification
Verify the service health using `curl` or any browser:
```bash
curl -s https://vitalis-ai-wtdy.onrender.com/health
```

Expected validation criteria:
- HTTP status code: `200 OK`
- `status`: `"healthy"`
- `toolsCount`: `6`
- `mcpSpecVersion`: `"2025-11-25"`
- `transport`: `"Official MCP Streamable HTTP"`

Test the public web application:
- Open `https://vitalis-ai-wtdy.onrender.com/` in a browser.
- Verify that the Echo Show smart display simulator renders Eleanor Vance's medication dashboard.

---

## ⚠️ Operational Limitations & Boundaries

1. **In-Memory State**:
   - The application uses an in-memory singleton (`PatientStore`) for Eleanor Vance's profile, medication statuses, vitals, and caregiver alerts.
   - Any service restart, deployment, or container recycling will reset the patient state back to initial seed data.
2. **Potential Free-Tier Cold Starts**:
   - As a general characteristic of cloud container hosting platforms (such as Render's free tier), inactive web services may spin down when idle. The first incoming request after inactivity may experience a 30-60 second cold start delay while the container spins up.
3. **Simulated Features**:
   - **Pill Bottle Verification**: Executed via the `verify_pill_bottle_vision` tool using structured test presets (`lisinopril_20mg`, `penicillin_mismatch`, `expired_bottle`). Live camera computer vision model inference is not implemented.
   - **Caregiver Alert Dispatching**: Alerts are logged into the in-memory `PatientStore` (`RECORDED_IN_CAREGIVER_PORTAL`) and displayed in the frontend Caregiver Portal; they are not dispatched over external cellular or SMS networks.
   - **Browser Voice**: Voice input and speech synthesis in the web application utilize the browser's Web Speech API. This is a smart-display web simulator and not native Alexa hardware integration.
4. **Android Deliverable Distinction**:
   - The native Android companion app (**Vitalis Care**, package `com.vitalis.app`) and its Qubator QAF 2.0 APK submission are distinct from this cloud-hosted web deployment. The web application hosts the interactive Echo Show simulator and MCP server, while the APK provides a native mobile client.
