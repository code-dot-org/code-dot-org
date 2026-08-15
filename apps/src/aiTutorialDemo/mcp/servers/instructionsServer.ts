import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {z} from 'zod';

import {MCP_APP_MIME_TYPE} from '../constants';
import {buildInstructionsWidgetHtml} from '../widgets/instructionsWidgetHtml';

export const INSTRUCTIONS_WIDGET_URI = 'ui://instructions-server/main';

// MCP Apps server for the persistent instructions strip above the activity
// area. Unlike the activity widgets, its tool declares slot: 'instructions'
// (a host placement hint), so calling it updates the strip without
// replacing whatever activity is on screen — and the host does not end the
// model's turn on it, so the model can update instructions and then present
// an activity in the same exchange.
export function createInstructionsServer(): McpServer {
  const server = new McpServer({
    name: 'instructions-server',
    version: '0.1.0',
  });

  server.registerTool(
    'set_instructions',
    {
      description:
        'Update the instructions panel that stays visible above the ' +
        'activity area. Use it to summarize what the student is working on ' +
        'and why, written for their grade level. It replaces the previous ' +
        'instructions but never the activity. Update it whenever the goal ' +
        'changes — typically right before presenting a new activity.',
      inputSchema: {
        title: z
          .string()
          .describe('Short heading for the current step, a few words'),
        body: z
          .string()
          .describe(
            'One to three plain-text sentences a student at the given ' +
              'grade level can read at a glance. Line breaks allowed ' +
              '(encode as \\n); no markdown.'
          ),
      },
      _meta: {
        ui: {
          resourceUri: INSTRUCTIONS_WIDGET_URI,
          visibility: ['model'],
          slot: 'instructions',
        },
      },
    },
    async () => ({
      content: [{type: 'text', text: 'Instructions panel updated.'}],
    })
  );

  server.registerResource(
    'instructions-widget',
    INSTRUCTIONS_WIDGET_URI,
    {
      description: 'Persistent instructions panel',
      mimeType: MCP_APP_MIME_TYPE,
      _meta: {ui: {prefersBorder: true}},
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: MCP_APP_MIME_TYPE,
          text: buildInstructionsWidgetHtml(),
        },
      ],
    })
  );

  return server;
}
