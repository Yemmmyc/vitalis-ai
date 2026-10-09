# Friction Log: Amazon Developer & Alexa+ MCP Experience

> **Devpost Submission Material**: 10% Judging Bonus Submission Entry  
> **Project**: Vitalis AI  

This document details candid developer friction encountered during the implementation and testing of **Vitalis AI**, covering the Model Context Protocol (MCP) SDK, Streamable HTTP transport, testing workflows, and Amazon Bedrock integration.

---

### Friction Entry 1: MCP Tool Output Schema Normalization

* **Task Attempted**: Returning structured JSON data objects from MCP tool execution handlers (`tools/call`).
* **Steps Taken**:
  1. Implemented tool execution handlers returning native JavaScript objects containing medication, triage, or vital records.
  2. Executed tool requests against the self-hosted MCP server.
* **Expected vs. Actual**:
  * *Expected*: The MCP SDK tool response handlers would accept direct JavaScript objects and handle stringification automatically.
  * *Actual*: The MCP specification requires tool responses to return a `content` array containing objects with explicit types (e.g., `{ content: [{ type: "text", text: "..." }] }`), requiring tool handlers to format and stringify non-text object payloads.
* **Severity**: Minor
* **Workaround Used**: Formatted tool output payloads into valid MCP content structures by wrapping JSON results as stringified text blocks (`JSON.stringify(result, null, 2)`).
* **Actionable Suggestion**: Provide convenience helpers or automatic JSON stringification utilities in `@modelcontextprotocol/sdk` for tool handlers that return object results.

---

### Friction Entry 2: MCP SDK Migration & PowerShell Session Header Handling During Session Testing

* **Task Attempted**: Migrating from an early manual JSON-RPC server prototype to the official `@modelcontextprotocol/sdk` with Streamable HTTP transport and validating stateful session headers (`mcp-session-id`).
* **Steps Taken**:
  1. Updated the Express server to use `@modelcontextprotocol/sdk` and `StreamableHTTPServerTransport`.
  2. Sent an initial MCP initialization POST request using PowerShell's `Invoke-WebRequest` to inspect response headers and extract `mcp-session-id`.
  3. Reused the extracted session header in subsequent requests to `/mcp` (such as `tools/list` and `tools/call`).
* **Expected vs. Actual**:
  * *Expected*: Extracting `Headers['mcp-session-id']` in PowerShell would return a single scalar string for use in downstream HTTP requests.
  * *Actual*: PowerShell exposed `Headers['mcp-session-id']` as a `System.String[]` array collection. Passing the array object directly in subsequent request headers caused session matching failures on the server.
* **Severity**: Low
* **Workaround Used**: Accessed the first element of the array (`$sessionId[0]`) in PowerShell test scripts before constructing headers for subsequent MCP requests.
* **Actionable Suggestion**: Include CLI and PowerShell testing examples in MCP SDK documentation highlighting header array unwrapping when scripting manual HTTP test requests.

---

### Friction Entry 3: Amazon Bedrock Model Access & Local Emulation Strategy

* **Task Attempted**: Enabling live Amazon Bedrock model invocations for the natural-language symptom triage workflow using `@aws-sdk/client-bedrock-runtime`.
* **Steps Taken**:
  1. Configured AWS SDK credentials and instantiated `BedrockRuntimeClient`.
  2. Submitted model use-case access request in the AWS console for Anthropic models.
  3. Attempted to execute `InvokeModelCommand` against Bedrock.
* **Expected vs. Actual**:
  * *Expected*: Immediate model availability upon configuring AWS credentials.
  * *Actual*: The request returned an authorization/access error because the account required additional use-case review and access approval for Anthropic models via AWS Support.
* **Severity**: Medium
* **Workaround Used**: Implemented an intelligent local Bedrock emulation layer in `bedrock-service.ts`. When live AWS Bedrock access is unavailable, the application seamlessly uses structured local text generation, enabling full offline development, automated testing, and UI demonstration without cloud blocking.
* **Actionable Suggestion**: Improve AWS console error messaging and onboarding guides for developer accounts to clearly distinguish between AWS IAM credential errors and foundation model access approval requirements.
