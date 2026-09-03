# 🏆 Vitalis AI: Hackathon Master Guide & Conversation Archive

**Hackathon**: Build, Ship, Shape: Amazon Developer Hackathon (2026)  
**Primary Track**: Alexa+ ($25,000 1st Place)  
**Mini-Challenges**: AWS Builder ($5,000) & Open Source ($5,000)  
**Bonus Target**: 10% Judging Bonus via Friction Logs  
**Project Directory**: `C:\Users\yemmm\Desktop\Buld_Ship_Shape`  
**Antigravity Conversation ID**: `5a9566ea-80c4-4f84-ba1c-839859ab5220`  

---

## 📌 Saved Form Answers

### 1. Devpost General Info
* **Project Name**: `Vitalis AI: Autonomous Eldercare for Alexa+`
* **Elevator Pitch**: 
  > *Autonomous multimodal health advocate on Alexa+ using MCP & Amazon Bedrock to keep seniors safe, healthy, and independent.*
* **Repository URL**: `https://github.com/Yemmmyc/vitalis-ai`

### 2. $150 AWS Credits Request Form
* **2-3 Sentence Pitch**:
  > *For the Alexa+ track, I am building Vitalis AI, an autonomous multimodal health and eldercare advocate designed to help seniors live safely and independently at home. The project leverages a self-hosted Model Context Protocol (MCP) server over Streamable HTTP and Amazon Bedrock to enable proactive voice check-ins, medication adherence tracking, and computer-vision verification of pill bottles. By combining real-time caregiver emergency escalation with Bedrock clinical triage tools, Vitalis AI transforms Echo smart displays from passive speakers into proactive, life-saving daily companions.*

---

## 💻 Running Vitalis AI Locally

To launch the Echo Show Smart Display simulator and the MCP server:

```powershell
cd C:\Users\yemmm\Desktop\Buld_Ship_Shape
npm run server:start
```

Open your browser to: **`http://localhost:4000`**

### What to demo in your test & video:
1. **Voice Query**: Click the microphone or click *"What pills do I need to take today?"*
2. **Camera Pill Scanner**: Click the top button, select **Amoxicillin / Penicillin (CRITICAL ALLERGY)**, and click **Verify Medication Now**. Observe the red alert!
3. **Caregiver Portal**: View real-time alert feed delivered to David Vance.
4. **MCP Developer Inspector**: Click **MCP Inspector** to reveal live JSON-RPC 2.0 streaming events and sub-50ms tool execution.

---

## 🚀 Pushing to GitHub

1. Open [github.com/new](https://github.com/new) and create a repository named **`vitalis-ai`** (set to **Public**, do NOT check README).
2. Run in terminal:
```powershell
cd C:\Users\yemmm\Desktop\Buld_Ship_Shape
git remote add origin https://github.com/Yemmmyc/vitalis-ai.git
git branch -M main
git push -u origin main
```

---

## 📂 Key Files in Your Project

| File | Purpose |
| :--- | :--- |
| `docs/SUBMISSION_DETAILS.md` | Full text for Devpost submission fields |
| `docs/PRODUCT_FEEDBACK.md` | Required product feedback on Amazon Developer tools |
| `docs/FRICTION_LOG.md` | Detailed friction logs for the **10% judging bonus** |
| `docs/VIDEO_SCRIPT_3MIN.md` | Exact 2m 45s script and shot list for your video |
| `server/` | Alexa+ MCP Server (Spec 2025-11-25, Streamable HTTP) |
| `client/` | Echo Show React/Vite/Tailwind simulator |
| `tests/mcp-server.test.mjs` | Automated test suite (all 8 tests passing) |
| `README.md` | Open-source GitHub documentation & architecture diagrams |
| `LICENSE` | MIT Open Source License |
