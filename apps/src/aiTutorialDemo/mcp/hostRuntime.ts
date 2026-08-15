import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {CallToolResult} from '@modelcontextprotocol/sdk/types.js';

import {ToolUiMeta, WidgetSlot} from './constants';

export interface McpServerFactory {
  name: string;
  create: () => McpServer;
}

// One tool as the host sees it after discovery: everything here came off the
// wire from tools/list, not from host-side knowledge of the servers. The
// agent's system prompt is generated from exactly this.
export interface DiscoveredTool {
  serverName: string;
  name: string;
  description?: string;
  inputSchema: unknown;
  uiResourceUri?: string;
  slot: WidgetSlot;
}

export interface McpActivityEntry {
  at: number;
  label: string;
  detail?: string;
}

type ActivityListener = (entry: McpActivityEntry) => void;

/**
 * The MCP-host side of the demo: connects a Client to each widget server,
 * discovers tools and prefetches their ui:// templates, and routes
 * tools/call by tool name.
 *
 * The servers run in-page over InMemoryTransport, but nothing here knows
 * that — swapping a factory for a StreamableHTTPClientTransport pointed at a
 * remote third-party server changes only `create()`.
 */
export class McpHostRuntime {
  private clientsByTool = new Map<string, Client>();
  private templates = new Map<string, string>();
  readonly tools: DiscoveredTool[] = [];

  private constructor(private onActivity?: ActivityListener) {}

  static async create(
    factories: McpServerFactory[],
    onActivity?: ActivityListener
  ): Promise<McpHostRuntime> {
    const runtime = new McpHostRuntime(onActivity);
    for (const factory of factories) {
      await runtime.connectServer(factory);
    }
    return runtime;
  }

  private log(label: string, detail?: unknown) {
    this.onActivity?.({
      at: Date.now(),
      label,
      detail:
        detail === undefined ? undefined : JSON.stringify(detail, null, 1),
    });
  }

  private async connectServer(factory: McpServerFactory) {
    const server = factory.create();
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    const client = new Client({
      name: 'ai-tutorial-demo-host',
      version: '0.1.0',
    });
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const {tools} = await client.listTools();
    this.log(
      `tools/list → ${factory.name}`,
      tools.map(t => t.name)
    );

    for (const tool of tools) {
      if (this.clientsByTool.has(tool.name)) {
        // Tool names are the model-facing identifiers, so a demo host keeps
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
        slot: uiMeta?.slot ?? 'stage',
      });

      // Prefetch templates at connect time, as the spec recommends, so a
      // tool call can render its view without a round trip.
      if (uiMeta?.resourceUri && !this.templates.has(uiMeta.resourceUri)) {
        const read = await client.readResource({uri: uiMeta.resourceUri});
        const html = read.contents.find(
          (c): c is typeof c & {text: string} =>
            'text' in c && typeof c.text === 'string'
        );
        if (html) {
          this.templates.set(uiMeta.resourceUri, html.text);
          this.log(
            `resources/read → ${uiMeta.resourceUri}`,
            `${html.text.length} bytes of HTML`
          );
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
    args: Record<string, unknown>
  ): Promise<CallToolResult> {
    const client = this.clientsByTool.get(name);
    if (!client) {
      throw new Error(`Unknown MCP tool: ${name}`);
    }
    this.log(`tools/call → ${name}`, args);
    const result = (await client.callTool({
      name,
      arguments: args,
    })) as CallToolResult;
    this.log(`tools/call ← ${name}`, result.content);
    return result;
  }
}
