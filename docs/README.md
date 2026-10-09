# Vitalis AI & Vitalis Care — Repository Documentation Index

This directory contains complete project, technical, and submission documentation for **Vitalis AI** and **Vitalis Care**.

To maintain total clarity, the documentation is organized around **two distinct submission deliverables**:

---

## 📌 Deliverable Contexts

### 🅰️ Qubator QAF 2.0 Product Submission
- **Project Name**: Vitalis AI
- **Deliverable**: Android Debug APK
- **User-Facing Mobile App Brand**: **Vitalis Care** (`application-label: Vitalis Care`, package `com.vitalis.app`)
- **Current Release**: [`v1.0.1`](https://github.com/Yemmmyc/vitalis-ai/releases/tag/v1.0.1)
- **Primary Release Asset**: `release-artifacts/Vitalis-Care-v1.0.1.apk`
- **Direct Download Link**: [`Vitalis-Care-v1.0.1.apk`](https://github.com/Yemmmyc/vitalis-ai/releases/download/v1.0.1/Vitalis-Care-v1.0.1.apk)
- **Focus**: Native Android APK compilation, OpenJDK 21 Gradle build, `@capacitor-community/text-to-speech` native audio output, microphone permissions (`RECORD_AUDIO`), responsive screen-fit layout, and physical Tecno Spark 20 hardware test verification.

### 🅱️ Original Devpost Hackathon Project
- **Project Name**: Vitalis AI — Autonomous AI Eldercare & Health Advocate on Alexa+
- **Deliverable**: Full-stack web application simulator and self-hosted Model Context Protocol (MCP) server
- **Primary Track & Mini-Challenges**: Alexa+ Track, AWS Builder, Open Source
- **Focus**: Interactive Echo Show smart-display web simulator (React 18 / Vite), self-hosted MCP server (Spec `2025-11-25`, Streamable HTTP `/mcp`), Amazon Bedrock AI integration (`@aws-sdk/client-bedrock-runtime`), telemetry stream (`/sse`), 3-minute video script, product feedback, and friction logs.

---

## 📁 Repository Documentation Directory Map

```text
docs/
├── README.md                      # Master Documentation Index & Overview (This file)
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
| **Qubator QAF 2.0** | [`docs/qaf-2.0/SUBMISSION_DETAILS.md`](file:///C:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/qaf-2.0/SUBMISSION_DETAILS.md) | QAF 2.0 Product Submission Details | Android APK build specifications, release `v1.0.1` details, SHA-256 checksum, file size, and physical device test evidence. |
| **Devpost Project** | [`docs/devpost/SUBMISSION_DETAILS.md`](file:///C:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/SUBMISSION_DETAILS.md) | Devpost Submission Overview | Original hackathon project fields, inspiration, track information, and full-stack web simulator overview. |
| **Devpost Project** | [`docs/devpost/VIDEO_SCRIPT_3MIN.md`](file:///C:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/VIDEO_SCRIPT_3MIN.md) | 3-Minute Video Script & Storyboard | Shot-by-shot video narration, timing, and demonstration storyboard for the hackathon video demo. |
| **Devpost Project** | [`docs/devpost/PRODUCT_FEEDBACK.md`](file:///C:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/PRODUCT_FEEDBACK.md) | Amazon Developer Product Feedback | Candid feedback on MCP SDK, Streamable HTTP, Amazon Bedrock, TypeScript/Node.js, and Web Speech API. |
| **Devpost Project** | [`docs/devpost/FRICTION_LOG.md`](file:///C:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/devpost/FRICTION_LOG.md) | Alexa+ MCP Developer Friction Log | Detailed friction entries for the 10% Devpost judging bonus (MCP output schemas, PowerShell headers, AWS model access). |
| **Shared Tech** | [`docs/shared/TECHNICAL_ARCHITECTURE.md`](file:///C:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/shared/TECHNICAL_ARCHITECTURE.md) | Technical Architecture & MCP Spec | Deep technical architecture, 6 registered MCP tool schemas, Streamable HTTP transport, and local Bedrock fallback emulator. |
| **Development** | [`docs/development/HACKATHON_MASTER_GUIDE.md`](file:///C:/Users/yemmm/Desktop/Buld_Ship_Shape/docs/development/HACKATHON_MASTER_GUIDE.md) | Hackathon Master Guide & Archive | Internal development reference, AWS credits form pitch, video recording plan, and historical test log archive. |

---

## 🔒 Working vs. Simulated Boundaries (Applicable to Both Submissions)

To maintain absolute transparency:

- **Working Local Implementation**: Express + `@modelcontextprotocol/sdk` (v1.0.4) server over Streamable HTTP (`/mcp`), 6 functional MCP tools with in-memory `PatientStore` state management, local Bedrock fallback emulator, native Android application with OpenJDK 21 Gradle build, native Text-To-Speech (`@capacitor-community/text-to-speech`), microphone interaction, and mobile screen-fit layout.
- **Simulated & Non-Production Scope**: Camera pill verification uses predefined test presets (`lisinopril_20mg`, `penicillin_mismatch`, `expired_bottle`); Caregiver alert dispatching updates the local in-memory store rather than sending live SMS/email messages; Smart display interface is demonstrated via web simulator and Capacitor Android wrapper rather than a deployed Alexa Skill Store skill.
