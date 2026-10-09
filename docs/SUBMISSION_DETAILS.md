# Hackathon Product Submission Details: Vitalis AI

## Project Title

**Vitalis AI — Autonomous AI Eldercare & Health Advocate on Alexa+**

## Elevator Pitch

Vitalis AI is an autonomous eldercare assistant and health advocate built around a self-hosted **Model Context Protocol (MCP)** server using MCP specification `2025-11-25` and **Streamable HTTP** transport. Powered by **Amazon Bedrock** and packaged in a native **Capacitor 8 Android application** with native Text-To-Speech, Vitalis AI coordinates medication tracking, visual pill-bottle verification, symptom triage with red-flag detection, vital monitoring, and caregiver alert dispatching.

## Primary Track & Mini-Challenges

- **Primary Track:** Alexa+
- **Mini-Challenge 1:** AWS Builder — Amazon Bedrock integration with intelligent local fallback mode
- **Mini-Challenge 2:** Open Source — MIT Licensed public GitHub repository: [https://github.com/Yemmmyc/vitalis-ai](https://github.com/Yemmmyc/vitalis-ai)

---

## Technical Architecture & Core Stack

1. **Model Context Protocol (MCP) Backend**: Node.js & Express server implementing MCP specification `2025-11-25` via `@modelcontextprotocol/sdk` (v1.0.4) using Streamable HTTP transport (`/mcp`) with stateful `mcp-session-id` session management and server-sent events telemetry (`/sse`).
2. **6 MCP Tools**:
   - `check_medication_schedule`: Time-of-day filtering & adherence calculation.
   - `log_medication_dose`: Streak-aware dose status logging (`taken`, `skipped`, `delayed`).
   - `verify_pill_bottle_vision`: Simulated visual pill verification and allergy safety checks.
   - `evaluate_health_symptoms`: Red-flag emergency detection and Bedrock-powered clinical triage.
   - `dispatch_caregiver_alert`: Caregiver portal notification dispatcher.
   - `get_daily_vital_summary`: Physiological vital monitoring summary.
3. **AI Core & Resilience Layer**: Amazon Bedrock integration (`@aws-sdk/client-bedrock-runtime`) for conversational response generation with an automatic local fallback emulator when AWS credentials are absent.
4. **Mobile & Audio Platform**: Capacitor 8 Android application wrapper with OpenJDK 21, `@capacitor-community/text-to-speech` for high-reliability native Android voice playback, and verified microphone permissions (`RECORD_AUDIO`).
5. **Responsive Mobile Layout**: Screen-fit layout optimized for 720x1612 mobile displays (verified on physical Tecno Spark 20).

---

## 🧪 Empirical Test & Build Verification

- **Automated Tests**: 13 / 13 passing unit tests validating protocol handshakes, tool discovery, dose state logic, time-of-day filters, and triage workflows.
- **Production Web Build**: Clean `npm run build` execution outputting optimized web assets and compiled server code.
- **Android APK Build & Physical Hardware Test**:
  - User-Facing App Name: **Vitalis Care** (`application-label: Vitalis Care`, package: `com.vitalis.app`)
  - Saved Release Asset: `release-artifacts/Vitalis-Care-v1.0.1.apk`
  - File Size: `4,491,016 bytes` (4.28 MB)
  - SHA-256 Checksum: `663F336628D278B6CE5C14530EAD1182BB6BF8B4CFA105E9D35A822442529248`
  - Physical Device Test: Streamed ADB update verified on physical Tecno Spark 20 (`TECNO_KJ7`), confirming launcher label **Vitalis Care**, package update, native Text-To-Speech audio output, voice input, and responsive mobile screen-fit layout.

---

## 🔒 Distinction Between Working vs. Simulated Functionality

- **Working Local Capabilities**: Self-hosted MCP server with Streamable HTTP, 6 active MCP tools, local Bedrock fallback emulator, native Android application with Capacitor 8, native Android TTS, and physical device screen-fit styling.
- **Simulated Workflows**: Camera OCR vision relies on predefined test presets (`lisinopril_20mg`, `penicillin_mismatch`, `expired_bottle`); Caregiver alert dispatching updates the local in-memory store rather than sending live SMS/email messages.

---

## 🔗 Submission URLs & Asset Links

- **Public GitHub Repository**: [https://github.com/Yemmmyc/vitalis-ai](https://github.com/Yemmmyc/vitalis-ai)
- **Latest Release (v1.0.1 - Vitalis Care)**: [https://github.com/Yemmmyc/vitalis-ai/releases/tag/v1.0.1](https://github.com/Yemmmyc/vitalis-ai/releases/tag/v1.0.1)
- **Direct APK Download URL (v1.0.1)**: [https://github.com/Yemmmyc/vitalis-ai/releases/download/v1.0.1/Vitalis-Care-v1.0.1.apk](https://github.com/Yemmmyc/vitalis-ai/releases/download/v1.0.1/Vitalis-Care-v1.0.1.apk)
- **Initial Release (v1.0.0)**: [https://github.com/Yemmmyc/vitalis-ai/releases/tag/v1.0.0](https://github.com/Yemmmyc/vitalis-ai/releases/tag/v1.0.0)
