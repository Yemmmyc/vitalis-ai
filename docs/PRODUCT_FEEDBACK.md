# Product Feedback: Amazon Developer Tools, Alexa+ MCP, and AWS Services

### Hackathon: Build, Ship, Shape (2026)

As required by the hackathon submission guidelines, below is our candid, detailed product feedback on every tool, API, and SDK used during the development of **Vitalis AI**.

---

## 1. Alexa+ Model Context Protocol (MCP Spec 2025-11-25) & Streamable HTTP
* **What we used it for**: Building a self-hosted MCP server that powers the clinical tool ecosystem for Alexa+ (medication schedules, vision inspection, symptom triage, caregiver alerts).
* **What worked well**: 
  * The transition to MCP as an open standard is the best architectural decision Amazon has made for Alexa. It eliminates proprietary skill silos and allows developers to write standard JSON-RPC 2.0 tools that work across ecosystems.
  * Streamable HTTP over Server-Sent Events (SSE) provides significantly lower latency than old polling mechanisms and simpler networking than bidirectional WebSockets.
* **What needs work**:
  * Formal TypeScript type definitions for the Streamable HTTP transport headers in the official `@modelcontextprotocol/sdk` could be expanded to make SSE event handling even more seamless.
* **Onboarding experience**: Excellent. Developers familiar with modern REST/RPC patterns will feel right at home within hours.
* **Would we build with it again?**: Absolutely 100%. MCP is the definitive future of agentic AI.

---

## 2. Amazon Bedrock (Claude 3.5 Sonnet & AWS Nova)
* **What we used it for**: Multimodal vision analysis of pill bottle prescription labels and empathetic clinical symptom triage dialogue.
* **What worked well**:
  * Claude 3.5 Sonnet on Bedrock is best-in-class for OCR extraction on curved, reflective pill bottle surfaces where standard OCR engines fail.
  * AWS Bedrock Converse API makes tool use and structured JSON outputs reliable and hallucination-resistant.
* **What needs work**:
  * Default quota limits on newly activated AWS accounts can sometimes require manual quota increase requests for Claude 3.5 Sonnet.
* **Onboarding experience**: Smooth through the AWS Console and `@aws-sdk/client-bedrock-runtime`.
* **Would we build with it again?**: Yes, Bedrock is our preferred foundation model orchestration platform.
