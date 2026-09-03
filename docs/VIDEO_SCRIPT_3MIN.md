# 3-Minute Video Script & Storyboard: Vitalis AI

> **Target Duration**: Exactly 2 minutes 45 seconds (Under the strict 3-minute hackathon cutoff).  
> **Speaker**: Clear, confident, energetic.  
> **Platform**: YouTube or Vimeo (Public, in English).  

---

### [0:00 - 0:25] ACT I: THE HOOK & THE CRISIS (25 Seconds)
* **Visual**: Close-up of an elderly woman holding a pill bottle, looking confused. Then cut to an Amazon Echo Show sitting on a kitchen counter.
* **Narration**:
  > *"Every day, over 54 million seniors in America face the challenge of living independently. We bought them Echo devices so they can stay connected, but let's be honest: traditional voice assistants are completely passive. If an aging parent forgets their blood pressure pills, gets dizzy, or takes the wrong bottle, Alexa does nothing.*  
  > *Until now. Welcome to **Vitalis AI**—the first autonomous, multimodal ambient health advocate built for **Alexa+**."*

---

### [0:25 - 1:15] ACT II: PROACTIVE AMBIENT CARE & THE MCP STANDARD (50 Seconds)
* **Visual**: Screen capture of the **Vitalis AI Echo Show Smart Display Simulator** running live at `http://localhost:4000`. Show the live clock, morning routine, and glowing Alexa+ ring.
* **Narration**:
  > *"Vitalis AI is built on the brand new **Model Context Protocol specification (2025-11-25)** using **Streamable HTTP**.*  
  > *Watch how it works. When 78-year-old Eleanor enters the kitchen, Alexa+ proactively greets her.*  
  > *(Voice Demo)*: 'Alexa, what pills do I need to take today?'  
  > *Instantly, Alexa invokes our self-hosted MCP server tool, `check_medication_schedule`. It checks Eleanor's prescriptions and answers with warmth: 'Good morning Eleanor! You have Lisinopril 20mg and Metformin 500mg pending. You're on an incredible 14-day streak!'*  
  > *With one touch or voice confirmation, the dose is logged, updating her streak and clinical record."*

---

### [1:15 - 2:00] ACT III: COMPUTER VISION SAFETY WITH AMAZON BEDROCK (45 Seconds)
* **Visual**: Click the **"Camera Pill Scanner"** button. Show the camera HUD bounding box overlay. Select the "Penicillin Mismatch" test sample.
* **Narration**:
  > *"Now, here is the real game-changer: multimodal safety. Medication errors are the #1 cause of accidental senior hospitalizations.*  
  > *Eleanor holds a bottle up to the Echo Show camera. Vitalis AI immediately triggers our `verify_pill_bottle_vision` tool powered by **Amazon Bedrock Multimodal Vision**.*  
  > *Bedrock reads the curved label, extracts the Rx number, and checks her allergy records. Watch this red alert: 'CRITICAL ALLERGY DETECTED: Amoxicillin Penicillin'. Vitalis instantly blocks the dose and dispatches an emergency alert to her son David's phone before she can take it."*

---

### [2:00 - 2:30] ACT IV: EMERGENCY ESCALATION & DEVELOPER TRANSPARENCY (30 Seconds)
* **Visual**: Click open the **"Caregiver Portal"** showing David Vance's live feed. Then slide open the **"MCP Inspector Drawer"** showing real-time JSON-RPC 2.0 streaming events.
* **Narration**:
  > *"On the Caregiver Portal, David receives real-time visibility into her vitals, medication adherence, and alerts.*  
  > *And for developers and judges: our live **MCP Inspector** shows the sub-50ms Streamable HTTP event stream in real time—verifying every JSON-RPC tool call, Bedrock token count, and latency metric."*

---

### [2:30 - 2:45] ACT V: CONCLUSION & CALL TO ACTION (15 Seconds)
* **Visual**: Full overview of the Vitalis AI dashboard with the tagline: *"Empowering Independent Aging with Alexa+ & Amazon Bedrock"*.
* **Narration**:
  > *"Vitalis AI proves how the Model Context Protocol and Amazon Bedrock transform Alexa+ from a reactive gadget into a compassionate, life-saving companion.*  
  > *Thank you, and let's shape the future of ambient care together!"*
