import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {describe, expect, it} from 'vitest';
import {z} from 'zod';

import {WidgetHostRuntime} from '../hostRuntime';

// Minimal fixture server exercising the real MCP wire path (tools/list,
// resources/read, tools/call) over the in-memory transport — the same calls
// a remote third-party widget server would receive. Deliberately not the PR
// demo's chart/choice/code/instructions servers (out of scope for this
// port); createWidgetServer.test.ts covers the generic descriptor-to-server
// bridge separately.
function createGreeterServer(): McpServer {
  const server = new McpServer({name: 'greeter-server', version: '0.1.0'});

  server.registerTool(
    'say_hello',
    {
      description: 'Greets the student by name.',
      inputSchema: {name: z.string()},
      _meta: {
        ui: {
          resourceUri: 'ui://greeter-server/main',
          visibility: ['model'],
          slot: 'stage',
        },
      },
    },
    async ({name}) => ({
      content: [{type: 'text', text: `Hello, ${name}!`}],
    }),
  );

  server.registerTool(
    'reset_greeting',
    {
      description: "Clears the widget's own state.",
      inputSchema: {},
      _meta: {
        ui: {resourceUri: 'ui://greeter-server/main', visibility: ['app']},
      },
    },
    async () => ({content: []}),
  );

  server.registerResource(
    'greeter-widget',
    'ui://greeter-server/main',
    {description: 'Greeting card', mimeType: 'text/html;profile=mcp-app'},
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/html;profile=mcp-app',
          text: '<!doctype html><html><body>ui/initialize</body></html>',
        },
      ],
    }),
  );

  return server;
}

describe('WidgetHostRuntime', () => {
  it('discovers every widget tool from advertised metadata', async () => {
    const runtime = await WidgetHostRuntime.create({
      servers: [{name: 'greeter-server', create: createGreeterServer}],
    });

    expect(runtime.tools.map(tool => tool.name).sort()).toEqual([
      'reset_greeting',
      'say_hello',
    ]);
    for (const tool of runtime.tools) {
      expect(tool.description).toBeTruthy();
      expect(tool.uiResourceUri).toBe('ui://greeter-server/main');
    }
  });

  it('reads visibility so the host can split model and app tools', async () => {
    const runtime = await WidgetHostRuntime.create({
      servers: [{name: 'greeter-server', create: createGreeterServer}],
    });

    expect(runtime.getTool('say_hello')?.visibility).toEqual(['model']);
    expect(runtime.getTool('reset_greeting')?.visibility).toEqual(['app']);
  });

  it('reads the slot placement hint from tool metadata', async () => {
    const runtime = await WidgetHostRuntime.create({
      servers: [{name: 'greeter-server', create: createGreeterServer}],
    });

    expect(runtime.getTool('say_hello')?.slot).toBe('stage');
    // Tools without a slot hint stay undefined — placement is host-defined.
    expect(runtime.getTool('reset_greeting')?.slot).toBeUndefined();
  });

  it('prefetches a renderable ui:// template per tool', async () => {
    const runtime = await WidgetHostRuntime.create({
      servers: [{name: 'greeter-server', create: createGreeterServer}],
    });

    const html = runtime.getTemplate('ui://greeter-server/main');
    expect(html).toContain('<!doctype html>');
  });

  it('routes tools/call by tool name and returns MCP content', async () => {
    const runtime = await WidgetHostRuntime.create({
      servers: [{name: 'greeter-server', create: createGreeterServer}],
    });

    const result = await runtime.callTool('say_hello', {name: 'Ada'});
    expect(result.content?.[0]).toMatchObject({
      type: 'text',
      text: 'Hello, Ada!',
    });
  });

  it('rejects unknown tools', async () => {
    const runtime = await WidgetHostRuntime.create({
      servers: [{name: 'greeter-server', create: createGreeterServer}],
    });

    await expect(runtime.callTool('no_such_tool', {})).rejects.toThrow(
      'Unknown MCP tool',
    );
  });

  it('rejects duplicate tool names across servers', async () => {
    await expect(
      WidgetHostRuntime.create({
        servers: [
          {name: 'a', create: createGreeterServer},
          {name: 'b', create: createGreeterServer},
        ],
      }),
    ).rejects.toThrow('Duplicate MCP tool name');
  });
});
