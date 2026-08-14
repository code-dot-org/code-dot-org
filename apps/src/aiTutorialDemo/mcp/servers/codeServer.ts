import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {z} from 'zod';

import {MCP_APP_MIME_TYPE} from '../constants';
import {buildCodeWidgetHtml} from '../widgets/codeWidgetHtml';

export const CODE_WIDGET_URI = 'ui://code-exercise-server/main';

// MCP Apps server for a small JavaScript exercise widget. Student code runs
// inside the widget's own sandboxed iframe (the sandbox is the interpreter);
// only the outcome of a Run — code, console output, error — comes back as a
// widget_event. Keystrokes never leave the widget.
export function createCodeServer(): McpServer {
  const server = new McpServer({
    name: 'code-exercise-server',
    version: '0.1.0',
  });

  server.registerTool(
    'present_code_exercise',
    {
      description:
        'Show the student a JavaScript coding exercise: instructions, an ' +
        'editable code editor with your starter code, and a Run button. ' +
        'Output is whatever the code prints with console.log. Each Run sends ' +
        'you a widget_event with the code and its output; judge correctness ' +
        'yourself. Calling this again replaces the exercise and the ' +
        "student's edits, so don't re-call it just to comment.",
      inputSchema: {
        instructions: z
          .string()
          .describe('What the student should do, 1-3 short sentences'),
        starterCode: z
          .string()
          .describe(
            'Initial editor contents. Include a console.log so Run shows ' +
              'something. Use TODO comments for the parts the student writes.'
          ),
      },
      _meta: {
        ui: {resourceUri: CODE_WIDGET_URI, visibility: ['model']},
      },
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: 'Exercise is now on screen. Wait for the student to run code.',
        },
      ],
    })
  );

  server.registerResource(
    'code-exercise-widget',
    CODE_WIDGET_URI,
    {
      description: 'JavaScript editor with a Run button and console output',
      mimeType: MCP_APP_MIME_TYPE,
      _meta: {ui: {prefersBorder: true}},
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: MCP_APP_MIME_TYPE,
          text: buildCodeWidgetHtml(),
        },
      ],
    })
  );

  return server;
}
