# Friction Log: Amazon Developer & Alexa+ MCP Experience

> **Submission Note**: Submitted for the **10% Judging Bonus** per hackathon guidelines.

---

### Friction Entry 1: Streamable HTTP Header Formatting for SSE Keep-Alive
* **Task Attempted**: Establishing persistent Server-Sent Events (SSE) connections between the Alexa+ client simulator and the self-hosted MCP server.
* **Steps Taken**:
  1. Initialized an Express HTTP server with `text/event-stream` headers.
  2. Attempted to pipe JSON-RPC 2.0 notifications over the stream.
  3. Observed intermittent proxy drops when idle for longer than 30 seconds.
* **Expected vs. Actual**:
  * *Expected*: Streamable HTTP spec documentation specifies automated ping/heartbeat cadence for proxies.
  * *Actual*: Standard Node HTTP connections timed out without explicit application-level `:keepalive

` comments.
* **Severity**: Moderate
* **Workaround Used**: Implemented an explicit 15-second heartbeat ping in `mcp-server.ts`.
* **Actionable Suggestion**: Include a standardized heartbeat utility directly in the starter samples for the Streamable HTTP transport.

---

### Friction Entry 2: Bedrock Multimodal Base64 Image Payload Constraints
* **Task Attempted**: Passing high-resolution camera frames from the Echo Show camera directly to the `verify_pill_bottle_vision` tool.
* **Steps Taken**:
  1. Captured raw camera canvas at 1080p.
  2. Encoded as data URI Base64 string.
  3. Sent payload to Bedrock `InvokeModelCommand`.
* **Expected vs. Actual**:
  * *Expected*: SDK handles chunked transfer of large base64 strings seamlessly.
  * *Actual*: Default Express body parsers threw `413 Payload Too Large` until explicit `limit: '25mb'` was added.
* **Severity**: Minor
* **Workaround Used**: Configured Express body-parser with `{ limit: '25mb' }` and added client-side image downscaling.
* **Actionable Suggestion**: Document recommended client-side image compression presets in the Alexa+ Echo Show Vision developer guides.

---

### Friction Entry 3: MCP Tool Output Schema Normalization
* **Task Attempted**: Returning complex structured objects from `tools/call`.
* **Steps Taken**:
  1. Returned native JavaScript object from tool handler.
  2. Client expected `content: [{ type: 'text', text: '...' }]`.
* **Expected vs. Actual**:
  * *Expected*: MCP SDK automatically serializes nested objects into text nodes.
  * *Actual*: Threw validation error if not explicitly stringified.
* **Severity**: Minor
* **Workaround Used**: Added generic serializer in `mcp-server.ts` to convert any returned object into valid JSON string text content.
* **Actionable Suggestion**: Enhance `@modelcontextprotocol/sdk` to accept native JSON objects in `tools/call` results and auto-wrap them.
