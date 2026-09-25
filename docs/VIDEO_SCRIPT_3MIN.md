# 3-Minute Video Script & Storyboard: Vitalis AI

> **Target Duration**: 2 minutes 45 seconds (Under the 3-minute hackathon cutoff).
> **Speaker**: Clear, articulate, developer-focused narration.
> **Platform**: YouTube or Vimeo (Public, English).

---

### [0:00 - 0:25] Section 1: Introduction & Problem Context (25 Seconds)
* **Visual**: Screen recording of the **Vitalis AI** interface in the Echo Show-style web display simulator.
* **Narration**:
  > *"Managing daily medication routines and staying aware of sudden health symptoms can be challenging for older adults living independently, as well as for their family caregivers. Traditional voice interactions often lack structured tool coordination.
  > *Welcome to **Vitalis AI**—a hackathon prototype and Echo Show-style web simulator built for the Alexa+ track, demonstrating how open tool protocols and generative AI can coordinate daily health workflows."*

---

### [0:25 - 1:10] Section 2: Alexa+ Concept & Model Context Protocol (45 Seconds)
* **Visual**: Main screen of the Echo Show smart display simulator. Demonstrate asking: *"Alexa, what pills do I need to take today?"* Highlight the `check_medication_schedule` tool execution badge.
* **Narration**:
  > *"Vitalis AI connects to a self-hosted Model Context Protocol (MCP) server matching specification **2025-11-25** using the official **Streamable HTTP** transport with stateful sessions.
  > *When a user asks, 'Alexa, what pills do I need to take today?', the assistant invokes our `check_medication_schedule` MCP tool. The tool retrieves scheduled doses, adherence status, and streak information from the demo profile.
  > *Users can confirm taking a dose, invoking `log_medication_dose` to update the demo medication state."*

---

### [1:10 - 1:45] Section 3: Medication Safety Simulation (35 Seconds)
* **Visual**: Open the **"Camera Pill Scanner"** modal. Select the **Amoxicillin / Penicillin** test preset. Show the resulting `CRITICAL_ALLERGY_ALERT` warning banner and simulation details.
* **Narration**:
  > *"Next, we demonstrate our medication verification workflow via the `verify_pill_bottle_vision` tool.
  > *This workflow operates as a predefined safety simulation. By selecting the Amoxicillin test preset, the system evaluates the medication identity against the patient's record and detects a critical penicillin allergy.
  > *The system blocks the dose, displays a prominent safety warning, and records a simulated caregiver alert into the portal."*

---

### [1:45 - 2:20] Section 4: Symptom Triage & Caregiver Portal Simulation (35 Seconds)
* **Visual**: Select or type: *"I am feeling sudden tight chest pain"*. Show the triage result, then open the **"Caregiver Portal"** modal to display the recorded emergency alert.
* **Narration**:
  > *"For symptom responses, the `evaluate_health_symptoms` tool applies configured emergency red-flag rules. When a severe symptom like chest pain is reported, deterministic safety rules trigger an emergency alert.
  > *Amazon Bedrock integration—or local Bedrock emulation when live access is unavailable—provides the empathetic conversational text response layer.
  > *Alert details, urgency levels, and suggested actions are recorded directly into the simulated caregiver oversight portal."*

---

### [2:20 - 2:40] Section 5: Developer Transparency & MCP Inspector (20 Seconds)
* **Visual**: Click to slide open the **"Alexa+ MCP Inspector"** drawer. Point out spec `2025-11-25`, the Streamable HTTP transport badge, 6 registered tools, and live JSON-RPC telemetry log.
* **Narration**:
  > *"For developer transparency, our embedded **MCP Inspector** displays the server status and live JSON-RPC event log.
  > *Judges can inspect the six registered MCP tools and observe real-time requests and responses. A separate Server-Sent Events (SSE) endpoint provides this dashboard telemetry stream alongside the primary Streamable HTTP transport."*

---

### [2:40 - 2:55] Section 6: Summary & Closing (15 Seconds)
* **Visual**: Full overview of the Vitalis AI Echo Show smart display dashboard with prototype notice.
* **Narration**:
  > *"Vitalis AI demonstrates how the open Model Context Protocol, Alexa+ concepts, and Amazon Bedrock can work together to coordinate structured eldercare workflows within clear prototype boundaries.
  > *Thank you for reviewing Vitalis AI for the Amazon Developer Hackathon!"*
