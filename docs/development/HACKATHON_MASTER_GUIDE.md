# 🏆 Vitalis AI: Hackathon Master Guide & Conversation Archive

**Hackathon**: Build, Ship, Shape: Amazon Developer Hackathon (2026)  
**Primary Track**: Alexa+ ($25,000 1st Place)  
**Mini-Challenges**: AWS Builder ($5,000) & Open Source ($5,000)  
**Bonus Target**: 10% Judging Bonus via Friction Logs  
**Project Directory**: `C:\Users\yemmm\Desktop\Buld_Ship_Shape`  
**Antigravity Conversation ID**: `5a9566ea-80c4-4f84-ba1c-839859ab5220`  

---

## 🌐 Confirmed Deployment & Public Access

| Property | Value |
| :--- | :--- |
| **Deployment Platform** | Render Web Service |
| **Live Web Application** | [https://vitalis-ai-wtdy.onrender.com/](https://vitalis-ai-wtdy.onrender.com/) |
| **Health & Diagnostics** | [https://vitalis-ai-wtdy.onrender.com/health](https://vitalis-ai-wtdy.onrender.com/health) |
| **MCP Streamable HTTP** | [https://vitalis-ai-wtdy.onrender.com/mcp](https://vitalis-ai-wtdy.onrender.com/mcp) |
| **Dashboard Telemetry SSE** | [https://vitalis-ai-wtdy.onrender.com/sse](https://vitalis-ai-wtdy.onrender.com/sse) |
| **Deployed Source Commit** | `3a37ca41b0cc41ac5c65ab00ef712c19f8098013` (`3a37ca4`) |
| **Deployment Build Command** | `npm ci && npm ci --prefix client && npm run build` |
| **Deployment Start Command** | `npm start` |
| **Deployment Documentation** | [`docs/deployment/RENDER_DEPLOYMENT.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/deployment/RENDER_DEPLOYMENT.md) |

> **Bedrock Emulation Status**: In the deployed Render service, `bedrock.configured` is `false` and `bedrock.mode` is `Local Intelligent Bedrock Emulation (Zero-Friction Dev)`. Live Bedrock inference is not active because AWS credentials are not configured in Render environment variables.

---

## 📌 Saved Form Answers

### 1. Devpost General Info
* **Project Name**: `Vitalis AI: Autonomous Eldercare for Alexa+`
* **Elevator Pitch**: 
  > *Autonomous multimodal health advocate on Alexa+ using MCP & Amazon Bedrock to keep seniors safe, healthy, and independent.*
* **Repository URL**: `https://github.com/Yemmmyc/vitalis-ai`
* **Live Demo URL**: `https://vitalis-ai-wtdy.onrender.com/`

### 2. $150 AWS Credits Request Form
* **2-3 Sentence Pitch**:
  > *For the Alexa+ track, I am building Vitalis AI, an autonomous multimodal health and eldercare advocate designed to help seniors live safely and independently at home. The project leverages a self-hosted Model Context Protocol (MCP) server over Streamable HTTP and Amazon Bedrock to enable proactive voice check-ins, medication adherence tracking, and computer-vision verification of pill bottles. By combining real-time caregiver emergency escalation with Bedrock clinical triage tools, Vitalis AI transforms Echo smart displays from passive speakers into proactive, life-saving daily companions.*

---

## 💻 Running Vitalis AI Locally

To launch the Echo Show Smart Display simulator and the MCP server in development mode:

```powershell
cd C:\Users\yemmm\Desktop\Buld_Ship_Shape
npm run dev
```

- **Web Simulator**: `http://localhost:3000`
- **MCP Server**: `http://localhost:4000`
- **Health Check**: `http://localhost:4000/health`
- **MCP Streamable HTTP**: `http://localhost:4000/mcp`

### What to demo in your test & video:
1. **Live Web App / Voice Query**: Visit `https://vitalis-ai-wtdy.onrender.com/` and click the microphone or click *"What pills do I need to take today?"*
2. **Camera Pill Scanner**: Click the top button, select **Amoxicillin / Penicillin (CRITICAL ALLERGY)**, and click **Verify Medication Now**. Observe the red alert!
3. **Caregiver Portal**: View real-time alert feed delivered to David Vance.
4. **MCP Developer Inspector**: Click **MCP Inspector** to reveal live JSON-RPC 2.0 streaming events and sub-50ms tool execution.

---

## 📋 Deployment & Verification Checklist

- [x] Full-stack application compiled (`server/dist` & `client/dist`).
- [x] Root `package.json` includes start script (`"node server/dist/index.js"`).
- [x] Server binds dynamically to `process.env.PORT` and `HOST` (`0.0.0.0`).
- [x] Render Web Service configured with `npm ci && npm ci --prefix client && npm run build` and `npm start`.
- [x] Live deployment verified on Render (`https://vitalis-ai-wtdy.onrender.com/`).
- [x] Health check returning 200 OK with `status: "healthy"`, `toolsCount: 6`, MCP spec `2025-11-25`.
- [x] Automated test suite passing (13/13 tests).
- [x] Bedrock emulation disclosure documented across repository.
- [ ] *(Optional Future Work)*: Configure live AWS IAM credentials on Render to enable live Amazon Bedrock API calls.
- [ ] *(Optional Future Work)*: Integrate real camera OCR model inference for pill scanning.
- [ ] *(Optional Future Work)*: Connect live SMS / push alerts for caregiver notifications.

---

## 📂 Key Files in Your Project

| File | Purpose |
| :--- | :--- |
| [`docs/deployment/RENDER_DEPLOYMENT.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/deployment/RENDER_DEPLOYMENT.md) | Render Web Service deployment and operational guide |
| [`docs/qaf-2.0/SUBMISSION_DETAILS.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/qaf-2.0/SUBMISSION_DETAILS.md) | Qubator QAF 2.0 Product Submission (APK) details |
| [`docs/devpost/SUBMISSION_DETAILS.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/SUBMISSION_DETAILS.md) | Full text for Devpost submission fields |
| [`docs/devpost/PRODUCT_FEEDBACK.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/PRODUCT_FEEDBACK.md) | Required product feedback on Amazon Developer tools |
| [`docs/devpost/FRICTION_LOG.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/FRICTION_LOG.md) | Detailed friction logs for the **10% judging bonus** |
| [`docs/devpost/VIDEO_SCRIPT_3MIN.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/VIDEO_SCRIPT_3MIN.md) | Exact 2m 45s script and shot list for your video |
| [`docs/shared/TECHNICAL_ARCHITECTURE.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/shared/TECHNICAL_ARCHITECTURE.md) | Shared technical architecture & 6 MCP tool schemas |
| `server/` | Alexa+ MCP Server (Spec 2025-11-25, Streamable HTTP) |
| `client/` | Echo Show React/Vite/Tailwind simulator |
| `tests/mcp-server.test.mjs` | Automated test suite (all 13 tests passing) |
| `README.md` | Authoritative open-source landing page & deployment reference |
| `LICENSE` | MIT Open Source License |
