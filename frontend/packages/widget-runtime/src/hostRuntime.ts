import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js';

import type {DiscoveredTool, ToolUiMeta} from './types';

export interface WidgetServerFactory {
  name: string;
  create: () => McpServer;
}

/**
 * The MCP-host side of the widget runtime: connects a Client to each widget
 * server, discovers tools and prefetches their ui:// templates, and routes
 * tools/call by tool name.
 *
 * Servers run in-page over InMemoryTransport, but nothing here knows that —
 * swapping a factory for a StreamableHTTPClientTransport pointed at a remote
 * third-party server changes only `create()`.
 */
export class WidgetHostRuntime {
  private clientsByTool = new Map<string, Client>();
  private templates = new Map<string, string>();
  readonly tools: DiscoveredTool[] = [];

  static async create(options: {
    servers: WidgetServerFactory[];
  }): Promise<WidgetHostRuntime> {
    const runtime = new WidgetHostRuntime();
    for (const factory of options.servers) {
      await runtime.connectServer(factory);
    }
    return runtime;
  }

  private async connectServer(factory: WidgetServerFactory) {
    const server = factory.create();
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    const client = new Client({
      name: 'widget-runtime-host',
      version: '0.1.0',
    });
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const {tools} = await client.listTools();
    for (const tool of tools) {
      if (this.clientsByTool.has(tool.name)) {
        // Tool names are the model-facing identifiers, so the host keeps
        // them globally unique instead of namespacing per server.
        throw new Error(`Duplicate MCP tool name: ${tool.name}`);
      }
      this.clientsByTool.set(tool.name, client);
      const uiMeta = (tool._meta as {ui?: ToolUiMeta} | undefined)?.ui;
      this.tools.push({
        serverName: factory.name,
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        uiResourceUri: uiMeta?.resourceUri,
        slot: uiMeta?.slot,
        visibility: uiMeta?.visibility ?? ['model', 'app'],
      });

      // Prefetch templates at connect time, as the spec recommends, so a
      // tool call can render its view without a round trip.
      if (uiMeta?.resourceUri && !this.templates.has(uiMeta.resourceUri)) {
        const read = await client.readResource({uri: uiMeta.resourceUri});
        const html = read.contents.find(
          (c): c is typeof c & {text: string} =>
            'text' in c && typeof c.text === 'string',
        );
        if (html) {
          this.templates.set(uiMeta.resourceUri, html.text);
        }
      }
    }
  }

  getTool(name: string): DiscoveredTool | undefined {
    return this.tools.find(tool => tool.name === name);
  }

  getTemplate(uri: string): string | undefined {
    return this.templates.get(uri);
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<CallToolResult> {
    const client = this.clientsByTool.get(name);
    if (!client) {
      throw new Error(`Unknown MCP tool: ${name}`);
    }
    return (await client.callTool({
      name,
      arguments: args,
    })) as CallToolResult;
  }
}
