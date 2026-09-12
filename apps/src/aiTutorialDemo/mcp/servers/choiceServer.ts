import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {z} from 'zod';

import {MCP_APP_MIME_TYPE} from '../constants';
import {buildChoiceWidgetHtml} from '../widgets/choiceWidgetHtml';

export const CHOICE_WIDGET_URI = 'ui://choice-server/main';

// A complete MCP Apps server for one widget: a tool the model calls to show
// a multiple-choice question, plus the ui:// template the host renders. The
// server itself is stateless — the widget owns the student's selection and
// reports it via ui/update-model-context. Everything the model knows about
// this widget comes from the metadata below (tools/list), which is what
// makes the server liftable to a remote process for third parties.
export function createChoiceServer(): McpServer {
  const server = new McpServer({name: 'choice-server', version: '0.1.0'});

  server.registerTool(
    'present_multiple_choice',
    {
      description:
        'Show the student a multiple-choice question in the widget area, ' +
        'replacing any widget currently shown. When the student submits an ' +
        'answer you receive a widget_event with their selection; grading is ' +
        'up to you. Calling this again replaces the question.',
      inputSchema: {
        question: z.string().describe('The question text, plain text'),
        choices: z
          .array(z.string())
          .min(2)
          .max(6)
          .describe('Answer options in display order'),
      },
      _meta: {
        ui: {resourceUri: CHOICE_WIDGET_URI, visibility: ['model']},
      },
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: 'Question is now on screen. Wait for the student to submit.',
        },
      ],
    })
  );

  server.registerResource(
    'multiple-choice-widget',
    CHOICE_WIDGET_URI,
    {
      description: 'Multiple-choice question view',
      mimeType: MCP_APP_MIME_TYPE,
      _meta: {ui: {prefersBorder: true}},
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: MCP_APP_MIME_TYPE,
          text: buildChoiceWidgetHtml(),
        },
      ],
    })
  );

  return server;
}
