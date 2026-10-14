# Vitalis AI & Vitalis Care — Repository Documentation Index

This directory contains complete project, technical, and submission documentation for **Vitalis AI** and **Vitalis Care**.

To maintain total clarity, the documentation is organized around **two distinct submission deliverables**:

---

## 📌 Deliverable Contexts

### 🅰️ Original Devpost Hackathon Project
- **Project Name**: Vitalis AI — Autonomous AI Eldercare & Health Advocate on Alexa+
- **Deliverable**: Live full-stack cloud web application simulator and self-hosted Model Context Protocol (MCP) server
- **Live Web Application**: [https://vitalis-ai-wtdy.onrender.com/](https://vitalis-ai-wtdy.onrender.com/)
- **Live Health Diagnostics**: [https://vitalis-ai-wtdy.onrender.com/health](https://vitalis-ai-wtdy.onrender.com/health)
- **Primary Track & Mini-Challenges**: Alexa+ Track, AWS Builder, Open Source
- **Focus**: Interactive Echo Show smart-display web simulator (React 18 / Vite), self-hosted MCP server (Spec `2025-11-25`, Streamable HTTP `/mcp`), Amazon Bedrock AI architecture (`@aws-sdk/client-bedrock-runtime`) with local emulation mode, dashboard telemetry stream (`/sse`), 3-minute video script, product feedback, and friction logs.
- **Deployment Documentation**: [`docs/deployment/RENDER_DEPLOYMENT.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/deployment/RENDER_DEPLOYMENT.md)

### 🅱️ Qubator QAF 2.0 Product Submission
- **Project Name**: Vitalis AI
- **Deliverable**: Android Debug APK
- **User-Facing Mobile App Brand**: **Vitalis Care** (`application-label: Vitalis Care`, package `com.vitalis.app`)
- **Current Release**: [`v1.0.1`](https://github.com/Yemmmyc/vitalis-ai/releases/tag/v1.0.1)
- **Primary Release Asset**: `release-artifacts/Vitalis-Care-v1.0.1.apk`
- **Direct Download Link**: [`Vitalis-Care-v1.0.1.apk`](https://github.com/Yemmmyc/vitalis-ai/releases/download/v1.0.1/Vitalis-Care-v1.0.1.apk)
- **Focus**: Native Android APK compilation, OpenJDK 21 Gradle build, `@capacitor-community/text-to-speech` native audio output, microphone permissions (`RECORD_AUDIO`), responsive screen-fit layout, and physical Tecno Spark 20 hardware test verification.

---

## 📁 Repository Documentation Directory Map

```text
docs/
├── README.md                      # Master Documentation Index & Overview (This file)
├── ANDROID_RELEASE_AUTOMATION.md  # Android Release Automation & Signing Migration Guide
├── deployment/                    # Cloud Deployment Documentation
│   └── RENDER_DEPLOYMENT.md       # Render live deployment URL, configuration, and verification
├── qaf-2.0/                       # Qubator QAF 2.0 Product Submission Documents
│   └── SUBMISSION_DETAILS.md      # QAF 2.0 APK submission specifications & device test evidence
├── devpost/                       # Original Devpost Hackathon Documents
│   ├── SUBMISSION_DETAILS.md      # Devpost submission text (Alexa+, AWS Builder, Open Source)
│   ├── VIDEO_SCRIPT_3MIN.md       # 3-minute video script & storyboard
│   ├── PRODUCT_FEEDBACK.md        # Amazon Developer & Alexa+ tool product feedback
│   └── FRICTION_LOG.md            # Developer friction log entries (10% Devpost judging bonus)
├── shared/                        # Shared Technical Architecture & Tool Specs
│   └── TECHNICAL_ARCHITECTURE.md  # System architecture, 6 MCP tools, Bedrock integration & local fallback
└── development/                   # Internal Development Records & Master Guides
    └── HACKATHON_MASTER_GUIDE.md  # Internal developer reference, AWS pitch, & test archive
```

---

## 📑 Classification & Inventory Matrix

| Category | File Path | Document Title | Primary Purpose & Context |
| :--- | :--- | :--- | :--- |
| **Cloud Deployment** | [`docs/deployment/RENDER_DEPLOYMENT.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/deployment/RENDER_DEPLOYMENT.md) | Render Web Service Deployment Guide | Confirmed live URLs, endpoints (`/`, `/health`, `/mcp`, `/sse`), Render service setup, Bedrock disclosure, and logs. |
| **Release CI/CD** | [`docs/ANDROID_RELEASE_AUTOMATION.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/ANDROID_RELEASE_AUTOMATION.md) | Android Release Automation Guide | GitHub Actions CI/CD workflows, JDK 21 build requirements, keystore secrets, release tagging, and signing migration. |
| **Devpost Project** | [`docs/devpost/SUBMISSION_DETAILS.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/SUBMISSION_DETAILS.md) | Devpost Submission Overview | Original hackathon project fields, live Render demo URL, track information, and full-stack web simulator overview. |
| **Qubator QAF 2.0** | [`docs/qaf-2.0/SUBMISSION_DETAILS.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/qaf-2.0/SUBMISSION_DETAILS.md) | QAF 2.0 Product Submission Details | Android APK build specifications, release `v1.0.1` details, SHA-256 checksum, file size, and physical device test evidence. |
| **Devpost Project** | [`docs/devpost/VIDEO_SCRIPT_3MIN.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/VIDEO_SCRIPT_3MIN.md) | 3-Minute Video Script & Storyboard | Shot-by-shot video narration, timing, and demonstration storyboard for the hackathon video demo. |
| **Devpost Project** | [`docs/devpost/PRODUCT_FEEDBACK.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/PRODUCT_FEEDBACK.md) | Amazon Developer Product Feedback | Candid feedback on MCP SDK, Streamable HTTP, Amazon Bedrock, TypeScript/Node.js, and Web Speech API. |
| **Devpost Project** | [`docs/devpost/FRICTION_LOG.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/FRICTION_LOG.md) | Alexa+ MCP Developer Friction Log | Detailed friction entries for the 10% Devpost judging bonus (MCP output schemas, PowerShell headers, AWS model access). |
| **Shared Tech** | [`docs/shared/TECHNICAL_ARCHITECTURE.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/shared/TECHNICAL_ARCHITECTURE.md) | Technical Architecture & MCP Spec | Deep technical architecture, 6 registered MCP tool schemas, Streamable HTTP transport, and local Bedrock fallback emulator. |
| **Development** | [`docs/development/HACKATHON_MASTER_GUIDE.md`](file:///c:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/development/HACKATHON_MASTER_GUIDE.md) | Hackathon Master Guide & Archive | Internal development reference, AWS credits form pitch, video recording plan, and deployment checklist. |

---

## 🔒 Working vs. Simulated Boundaries (Applicable to Both Submissions)

To maintain absolute transparency:

- **Working Implementation**:
  - Live Render Web Service deployment serving the full-stack web simulator at `https://vitalis-ai-wtdy.onrender.com/`.
  - Express + `@modelcontextprotocol/sdk` (v1.0.4) server over Streamable HTTP (`/mcp`) matching specification `2025-11-25`.
  - 6 functional MCP tools with in-memory `PatientStore` state management.
  - Native Android application with OpenJDK 21 Gradle build, native Text-To-Speech (`@capacitor-community/text-to-speech`), microphone interaction, and mobile screen-fit layout.
- **Simulated & Non-Production Scope**:
  - **Amazon Bedrock AI**: The deployed service runs in **Local Intelligent Bedrock Emulation** (`bedrock.configured = false`). While model ID `anthropic.claude-3-5-sonnet-20241022-v2:0` is configured in code, live Bedrock inference is not invoked in the deployed service because AWS credentials are not configured in Render. Real Bedrock integration remains future work.
  - **Pill Verification**: Camera pill verification uses predefined test scenarios (`lisinopril_20mg`, `penicillin_mismatch`, `expired_aspirin`) rather than real-time machine learning OCR.
  - **Caregiver Alert Dispatching**: Updates the local in-memory store (`RECORDED_IN_CAREGIVER_PORTAL`) rather than sending live SMS/telephony messages.
  - **Voice & Smart Display**: Demonstrated via the live web simulator (Web Speech API) and Capacitor Android wrapper rather than a deployed Alexa Skill Store skill.
  - **State Persistence**: State is held in-memory and resets when the server restarts or redeploys.
