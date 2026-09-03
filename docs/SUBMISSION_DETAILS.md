# Hackathon Submission Details: Vitalis AI

## Project Title
**Vitalis AI — Autonomous Multimodal Ambient Eldercare & Health Advocate on Alexa+**

## Elevator Pitch
Vitalis AI is an autonomous, multimodal ambient care advocate built for Alexa+ using the Model Context Protocol (MCP Spec 2025-11-25) and Amazon Bedrock. It empowers seniors to live safely and independently through proactive voice check-ins, computer-vision pill bottle verification, and instant caregiver escalation.

## Primary Track & Mini-Challenges
* **Primary Track**: Alexa+
* **Mini-Challenge 1**: AWS Builder (Amazon Bedrock integration)
* **Mini-Challenge 2**: Open Source (MIT Licensed public repository)

---

## Inspiration
Over 54 million American seniors live alone or manage chronic illnesses. Families often worry constantly: *Did mom take her blood pressure medication this morning? Is she drinking enough water? What happens if she gets dizzy and falls?*

While smart speakers like Amazon Echo are ubiquitous in homes, traditional voice assistants are fundamentally reactive. They wait to be addressed. If an elder is confused, takes the wrong pill, or experiences chest tightness, a passive assistant does nothing. 

With the debut of **Alexa+**, the open **Model Context Protocol (MCP)**, and **Amazon Bedrock**, we realized we could bridge this gap: turning the Echo Show into an empathetic, proactive clinical partner that preserves elder dignity while granting family caregivers total peace of mind.

---

## What It Does
1. **Proactive Multimodal Check-Ins**: Greets seniors naturally, assessing cognitive clarity, tracking water intake, and monitoring daily vitals.
2. **Echo Show Computer Vision Pill Scanner**: The senior holds their pill bottle up to the smart display camera. Using Amazon Bedrock Computer Vision, Vitalis reads the prescription label, validates dosage, verifies that it matches the authorized doctor order, and sounds an immediate emergency alarm if a severe allergy (e.g. Penicillin) is detected.
3. **Model Context Protocol (MCP) Integration**: Built on the latest **Streamable HTTP (spec 2025-11-25)** standard, providing 6 clinical tools for adherence tracking, symptom triage, and telemetry.
4. **Caregiver Circle Escalation**: Dispatches real-time alerts to family members (e.g., David Vance) with categorized urgency levels (`INFO`, `WARNING`, `URGENT`, `EMERGENCY`) and actionable next steps.
5. **Developer Live Inspector**: A built-in diagnostic drawer providing transparency into real-time JSON-RPC 2.0 tool requests, streaming SSE events, Bedrock latency, and token metrics.

---

## How We Built It
* **Alexa+ MCP Backend**: Node.js & TypeScript implementing the Model Context Protocol over Streamable HTTP and Server-Sent Events (SSE).
* **AI Core**: Amazon Bedrock (`anthropic.claude-3-5-sonnet-20241022-v2:0` & AWS Nova) for clinical symptom reasoning and multimodal optical bottle verification.
* **Echo Show Simulator**: React 18, Vite, and Tailwind CSS mimicking the ambient smart-display interface of the Echo Show 15 / 21.
* **Voice Synthesis & Recognition**: Browser Web Speech API providing natural speech recognition and elder-friendly vocal feedback.

---

## Challenges We Overcame
1. **Navigating the Brand-New Alexa+ MCP Spec (2025-11-25)**: Implementing the Streamable HTTP transport and Server-Sent Events protocol required careful handling of connection heartbeats and chunked JSON-RPC streams.
2. **Clinical Hallucination Guardrails**: In healthcare, an AI cannot guess. We engineered strict prompt boundaries and deterministic tool validations to ensure that dangerous drug allergies and emergency red flags are never ignored.

---

## Accomplishments We're Proud Of
* Sub-50ms tool execution over Streamable HTTP.
* Complete visual simulation of the Echo Show smart display experience with zero hardware prerequisites.
* Comprehensive test suite verifying all MCP endpoints and tool behaviors.

---

## What We Learned
The Model Context Protocol is a transformative standard for voice AI. Moving from brittle rigid skills to dynamic, tool-calling agentic architectures allows voice assistants to adapt to human nuance in ways never before possible.

---

## What's Next for Vitalis AI
* Integration with Amazon Pharmacy and PillPack for automated one-click refills.
* Smart home radar sensing (via Echo device ambient sensing) to detect sudden falls without wearable pendants.
* FHIR / HL7 clinical EHR integration to sync directly with primary care physicians.
