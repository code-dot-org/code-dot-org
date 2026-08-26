import {describe, expect, it} from 'vitest';

import {WidgetHostRuntime} from '../hostRuntime';
import type {WidgetDescriptor} from '../types';
import {createWidgetServer} from '../widgetServer';

describe('createWidgetServer', () => {
  const descriptor: WidgetDescriptor = {
    id: 'balance-the-data',
    toolName: 'present_balance_the_data',
    title: 'Balance the Data',
    description: 'Shows a drag-to-balance dataset activity.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {type: 'string', description: 'Instructions for the student'},
        maxAttempts: {type: 'integer'},
      },
      required: ['prompt'],
    },
    resourceUri: 'ui://widgets/balance-the-data.html',
    visibility: ['model'],
    network: 'none',
  };
  const html = '<!doctype html><html><body>balance the data</body></html>';

  async function createRuntime() {
    return WidgetHostRuntime.create({
      servers: [
        {
          name: descriptor.id,
          create: () => createWidgetServer(descriptor, html),
        },
      ],
    });
  }

  it('discovers the tool with the descriptor UI metadata', async () => {
    const runtime = await createRuntime();

    const tool = runtime.getTool(descriptor.toolName);
    expect(tool).toMatchObject({
      description: descriptor.description,
      uiResourceUri: descriptor.resourceUri,
      visibility: descriptor.visibility,
    });
  });

  it('prefetches the widget HTML verbatim as the tool template', async () => {
    const runtime = await createRuntime();

    expect(runtime.getTemplate(descriptor.resourceUri)).toBe(html);
  });

  it('echoes the call arguments back as structuredContent.input', async () => {
    const runtime = await createRuntime();

    const result = await runtime.callTool(descriptor.toolName, {
      prompt: 'Balance these five numbers',
    });
    expect(result.structuredContent).toEqual({
      input: {prompt: 'Balance these five numbers'},
    });
    expect(result.content).toEqual([]);
  });

  it('reports a call missing a required argument as a tool error', async () => {
    const runtime = await createRuntime();

    const result = await runtime.callTool(descriptor.toolName, {});
    expect(result.isError).toBe(true);
  });
});
