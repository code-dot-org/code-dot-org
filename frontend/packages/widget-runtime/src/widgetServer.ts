import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {ZodTypeAny} from 'zod';
import {z} from 'zod';

import {MCP_APP_MIME_TYPE} from './types';
import type {WidgetDescriptor} from './types';

function jsonSchemaPropertyToZod(
  propertySchema: Record<string, unknown>,
): ZodTypeAny {
  const description =
    typeof propertySchema.description === 'string'
      ? propertySchema.description
      : undefined;
  let zodType: ZodTypeAny;
  switch (propertySchema.type) {
    case 'string':
      zodType = z.string();
      break;
    case 'number':
      zodType = z.number();
      break;
    case 'integer':
      zodType = z.number().int();
      break;
    case 'boolean':
      zodType = z.boolean();
      break;
    case 'array':
      zodType = z.array(z.unknown());
      break;
    case 'object':
      zodType = z.record(z.string(), z.unknown());
      break;
    default:
      zodType = z.unknown();
  }
  return description ? zodType.describe(description) : zodType;
}

/**
 * Bridges an authored widget's JSON Schema input contract to the zod raw
 * shape `McpServer.registerTool` requires (the SDK's high-level API only
 * accepts zod schemas — confirmed against the installed
 * @modelcontextprotocol/sdk, no plain-JSON-Schema path exists there). Covers
 * the flat `{type: 'object', properties, required}` shape an authoring
 * agent produces for a widget's tool arguments, not general JSON Schema:
 * unrecognized property types fall through to `z.unknown()` rather than
 * rejecting the descriptor.
 */
function jsonSchemaToZodShape(
  inputSchema: Record<string, unknown>,
): Record<string, ZodTypeAny> {
  const properties = (inputSchema.properties ?? {}) as Record<
    string,
    Record<string, unknown>
  >;
  const required = new Set(
    (inputSchema.required as string[] | undefined) ?? [],
  );
  const shape: Record<string, ZodTypeAny> = {};
  for (const [key, propertySchema] of Object.entries(properties)) {
    const zodType = jsonSchemaPropertyToZod(propertySchema);
    shape[key] = required.has(key) ? zodType : zodType.optional();
  }
  return shape;
}

/**
 * Builds a generic in-memory MCP server from an authored widget descriptor
 * and its rendered HTML: one tool, one resource. Calling the tool is the
 * render trigger — the widget itself receives its data via the host's
 * tool-input/tool-result notifications (see WidgetFrame), so the handler
 * only needs to echo the call back as structured content. This is what
 * makes a trivial widget require no remote infrastructure: authoring one
 * is calling this function, not standing up a server.
 */
export function createWidgetServer(
  descriptor: WidgetDescriptor,
  html: string,
): McpServer {
  const server = new McpServer({name: descriptor.id, version: '0.1.0'});

  server.registerTool(
    descriptor.toolName,
    {
      description: descriptor.description,
      inputSchema: jsonSchemaToZodShape(descriptor.inputSchema),
      _meta: {
        ui: {
          resourceUri: descriptor.resourceUri,
          visibility: descriptor.visibility,
        },
      },
    },
    async args => ({
      content: [],
      structuredContent: {input: args},
    }),
  );

  server.registerResource(
    descriptor.id,
    descriptor.resourceUri,
    {
      description: descriptor.title,
      mimeType: MCP_APP_MIME_TYPE,
    },
    async uri => ({
      contents: [{uri: uri.href, mimeType: MCP_APP_MIME_TYPE, text: html}],
    }),
  );

  return server;
}
