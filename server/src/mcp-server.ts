import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

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

/**
 * Converts the existing Vitalis JSON Schema definitions into
 * Zod schemas understood by the official MCP SDK.
 *
 * This keeps the existing tool implementations unchanged.
 */
function jsonSchemaToZodShape(
  schema: Record<string, any>
): Record<string, z.ZodTypeAny> {
  const properties = schema?.properties ?? {};
  const required = new Set<string>(schema?.required ?? []);

  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [name, definition] of Object.entries<any>(properties)) {
    let field: z.ZodTypeAny;

    if (definition.enum) {
      field = z.enum(definition.enum as [string, ...string[]]);
    } else {
      switch (definition.type) {
        case "string":
          field = z.string();
          break;

        case "number":
          field = z.number();
          break;

        case "integer":
          field = z.number().int();
          break;

        case "boolean":
          field = z.boolean();
          break;

        case "array":
          field = z.array(z.unknown());
          break;

        case "object":
          field = z.record(z.string(), z.unknown());
          break;

        default:
          field = z.unknown();
      }
    }

    if (definition.description) {
      field = field.describe(definition.description);
    }

    if (!required.has(name)) {
      field = field.optional();
    }

    shape[name] = field;
  }

  return shape;
}

export class MCPServer {
  private tools: Map<string, MCPToolDefinition> = new Map();

  private protocolVersion = "2025-11-25";

  /**
 * Creates a fresh official MCP SDK server for each
 * Streamable HTTP session.
 */
public createSDKServer(): McpServer {
  const sdkServer = new McpServer({
    name: "vitalis-alexa-mcp-server",
    version: "1.0.0",
    description:
      "Vitalis AI - Eldercare and health advocate on Alexa+ via Model Context Protocol",
  });

  for (const tool of this.tools.values()) {
    const inputSchema = jsonSchemaToZodShape(tool.inputSchema);

    sdkServer.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema,
      },
      async (args) => {
        try {
          const result = await tool.handler(args);

          return {
            content: [
              {
                type: "text",
                text:
                  typeof result === "string"
                    ? result
                    : JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: error?.message || "Tool execution failed",
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  return sdkServer;
}
  constructor() {
    this.registerToolCollection(medicationTools);
    this.registerToolCollection(pillVisionTools);
    this.registerToolCollection(triageTools);
    this.registerToolCollection(caregiverAlertTools);

    console.log(
      `[MCPServer] Initialized with ${this.tools.size} registered tools adhering to MCP Spec ${this.protocolVersion}`
    );
  }

  private registerToolCollection(toolsList: MCPToolDefinition[]) {
    for (const tool of toolsList) {
      this.tools.set(tool.name, tool);
    }
  }

  /**
   * Register the existing Vitalis tools with the official MCP SDK server.
   */
   public getToolsList() {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
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

  /**
   * Legacy JSON-RPC handler retained for the existing unit tests.
   *
   * The production HTTP /mcp endpoint will use the official
   * StreamableHTTPServerTransport instead.
   */
  public async handleJSONRPC(
    request: JSONRPCRequest
  ): Promise<JSONRPCResponse> {
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
                description:
                  "Vitalis AI - Eldercare and health advocate on Alexa+ via Model Context Protocol",
              },
              capabilities: {
                tools: { listChanged: false },
                resources: { subscribe: false, listChanged: false },
                prompts: { listChanged: false },
                logging: {},
              },
            },
          };

        case "tools/list":
          return {
            jsonrpc: "2.0",
            id,
            result: {
              tools: this.getToolsList(),
            },
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
                message: `Tool not found: ${toolName}`,
              },
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
                  text:
                    typeof result === "string"
                      ? result
                      : JSON.stringify(result, null, 2),
                },
              ],
              isError: false,
            },
          };
        }

        case "ping":
          return {
            jsonrpc: "2.0",
            id,
            result: {},
          };

        default:
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
          };
      }
    } catch (err: any) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32000,
          message:
            err?.message || "Internal server error during tool execution",
        },
      };
    }
  }
}