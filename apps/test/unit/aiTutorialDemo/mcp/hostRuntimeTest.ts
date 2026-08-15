import {McpHostRuntime} from '@cdo/apps/aiTutorialDemo/mcp/hostRuntime';
import {createChartServer} from '@cdo/apps/aiTutorialDemo/mcp/servers/chartServer';
import {createChoiceServer} from '@cdo/apps/aiTutorialDemo/mcp/servers/choiceServer';
import {createCodeServer} from '@cdo/apps/aiTutorialDemo/mcp/servers/codeServer';
import {createInstructionsServer} from '@cdo/apps/aiTutorialDemo/mcp/servers/instructionsServer';

// Exercises the real MCP wire path (tools/list, resources/read, tools/call)
// over the in-memory transport — the same calls a remote third-party widget
// server would receive.
describe('McpHostRuntime', () => {
  let runtime: McpHostRuntime;

  beforeAll(async () => {
    runtime = await McpHostRuntime.create([
      {name: 'instructions-server', create: createInstructionsServer},
      {name: 'chart-server', create: createChartServer},
      {name: 'choice-server', create: createChoiceServer},
      {name: 'code-exercise-server', create: createCodeServer},
    ]);
  });

  it('discovers every widget tool from advertised metadata', () => {
    expect(runtime.tools.map(tool => tool.name).sort()).toEqual([
      'present_code_exercise',
      'present_multiple_choice',
      'set_instructions',
      'show_bar_chart',
    ]);
    for (const tool of runtime.tools) {
      expect(tool.description).toBeTruthy();
      // Input schemas arrive as JSON Schema, converted by the server SDK.
      expect(tool.inputSchema).toMatchObject({type: 'object'});
      expect(tool.uiResourceUri).toMatch(/^ui:\/\//);
    }
  });

  it('reads the slot placement hint from tool metadata', () => {
    expect(runtime.getTool('set_instructions')?.slot).toBe('instructions');
    // Tools without a hint default to the activity area.
    expect(runtime.getTool('show_bar_chart')?.slot).toBe('stage');
  });

  it('prefetches a renderable MCP App template per tool', () => {
    for (const tool of runtime.tools) {
      const html = runtime.getTemplate(tool.uiResourceUri!);
      expect(html).toContain('<!doctype html>');
      // The widget-side protocol shim must be inlined for the sandboxed
      // iframe to speak to the host.
      expect(html).toContain('ui/initialize');
    }
  });

  it('routes tools/call by tool name and returns MCP content', async () => {
    const result = await runtime.callTool('present_multiple_choice', {
      question: 'What is the mean of 2 and 4?',
      choices: ['2', '3', '4'],
    });
    expect(result.content?.[0]).toMatchObject({type: 'text'});
  });

  it('rejects unknown tools', async () => {
    await expect(runtime.callTool('no_such_tool', {})).rejects.toThrow(
      'Unknown MCP tool'
    );
  });
});
