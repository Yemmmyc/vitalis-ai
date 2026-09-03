import { medicationTools } from "./tools/medication.js";
import { pillVisionTools } from "./tools/pill-vision.js";
import { triageTools } from "./tools/triage.js";
import { caregiverAlertTools } from "./tools/caregiver-alert.js";

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  handler: (args: any) => Promise<any>;
}

export interface JSONRPCRequest {
  jsonrpc: string;
  id?: string | number;
  method: string;
  params?: any;
}

export interface JSONRPCResponse {
  jsonrpc: string;
  id?: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class MCPServer {
  private tools: Map<string, MCPToolDefinition> = new Map();
  private protocolVersion = "2025-11-25";

  constructor() {
    this.registerToolCollection(medicationTools);
    this.registerToolCollection(pillVisionTools);
    this.registerToolCollection(triageTools);
    this.registerToolCollection(caregiverAlertTools);

    console.log(`[MCPServer] Initialized with ${this.tools.size} registered tools adhering to MCP Spec ${this.protocolVersion}`);
  }

  private registerToolCollection(toolsList: MCPToolDefinition[]) {
    for (const tool of toolsList) {
      this.tools.set(tool.name, tool);
    }
  }

  public getToolsList() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema
    }));
  }

  public getTool(name: string) {
    return this.tools.get(name);
  }

  public async executeTool(name: string, args: any) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found.`);
    }
    return await tool.handler(args);
  }

  public async handleJSONRPC(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    const { id, method, params } = request;

    try {
      switch (method) {
        case "initialize":
          return {
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: this.protocolVersion,
              serverInfo: {
                name: "vitalis-alexa-mcp-server",
                version: "1.0.0",
                description: "Vitalis AI - Autonomous Eldercare & Health Advocate on Alexa+ via Model Context Protocol"
              },
              capabilities: {
                tools: { listChanged: false },
                resources: { subscribe: false, listChanged: false },
                prompts: { listChanged: false },
                logging: {}
              }
            }
          };

        case "tools/list":
          return {
            jsonrpc: "2.0",
            id,
            result: {
              tools: this.getToolsList()
            }
          };

        case "tools/call": {
          const toolName = params?.name;
          const toolArguments = params?.arguments || {};
          const tool = this.tools.get(toolName);

          if (!tool) {
            return {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32601,
                message: `Tool not found: ${toolName}`
              }
            };
          }

          const result = await tool.handler(toolArguments);
          return {
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: typeof result === "string" ? result : JSON.stringify(result, null, 2)
                }
              ],
              isError: false
            }
          };
        }

        case "ping":
          return {
            jsonrpc: "2.0",
            id,
            result: {}
          };

        default:
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`
            }
          };
      }
    } catch (err: any) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32000,
          message: err.message || "Internal server error during tool execution"
        }
      };
    }
  }
}
