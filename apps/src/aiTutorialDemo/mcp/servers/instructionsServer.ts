import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {Output} from 'ai';
import {z} from 'zod';
import {z as zV3} from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {MCP_APP_MIME_TYPE} from '../constants';
import {buildInstructionsWidgetHtml} from '../widgets/instructionsWidgetHtml';

export const INSTRUCTIONS_WIDGET_URI = 'ui://instructions-server/main';

// The grade the tutor writes canonical text for; the widget's dropdown
// starts here, and releveling is skipped when it's selected. Must match
// DEFAULT_GRADE in the widget HTML.
export const DEFAULT_INSTRUCTIONS_GRADE = 'grade 5';

const relevelOutput = Output.object({
  schema: zV3.object({
    title: zV3.string(),
    body: zV3.string(),
  }),
});

// MCP Apps server for the persistent instructions strip — and the demo's
// example of a plugin with capability of its own. The tutor sends canonical
// text once (set_instructions); the widget owns a grade dropdown and calls
// relevel_instructions — visible to the app only, never to the model — to
// rewrite the stored canonical text for the selected grade. The rewrite
// here goes through the AI gateway on a small model; a real third-party
// plugin would do the same call against its own backend. Grade changes also
// reach the tutor, but as a widget event the widget emits, not through this
// server.
export function createInstructionsServer(): McpServer {
  const server = new McpServer({
    name: 'instructions-server',
    version: '0.2.0',
  });

  // The one piece of server state: the last canonical instructions, so a
  // grade change can be releveled without another tutor turn.
  let canonical: {title: string; body: string} | null = null;

  server.registerTool(
    'set_instructions',
    {
      description:
        'Update the instructions panel that stays visible above the ' +
        'activity area. Write the text once, in plain neutral language at ' +
        'about a grade 5 reading level — the panel itself rewrites it for ' +
        'the grade level the student selects, so never re-send ' +
        'instructions just because the grade changed. It replaces the ' +
        'previous instructions but never the activity. Update it whenever ' +
        'the goal changes — typically right before presenting a new ' +
        'activity.',
      inputSchema: {
        title: z
          .string()
          .describe('Short heading for the current step, a few words'),
        body: z
          .string()
          .describe(
            'One to three plain-text sentences. Line breaks allowed ' +
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
    async input => {
      canonical = {title: input.title, body: input.body};
      return {
        content: [{type: 'text', text: 'Instructions panel updated.'}],
      };
    }
  );

  server.registerTool(
    'relevel_instructions',
    {
      description:
        'Rewrite the current instructions for a grade level. Called by the ' +
        'instructions view when the student changes the grade dropdown; ' +
        'not available to the model.',
      inputSchema: {
        grade: z
          .string()
          .describe('Target level, e.g. "grade 3" or "high school"'),
      },
      outputSchema: {
        title: z.string(),
        body: z.string(),
      },
      // App-only: the host omits this tool from the model's tool list and
      // rejects model calls to it, per the MCP Apps visibility semantics.
      _meta: {
        ui: {
          resourceUri: INSTRUCTIONS_WIDGET_URI,
          visibility: ['app'],
          slot: 'instructions',
        },
      },
    },
    async ({grade}) => {
      if (!canonical) {
        throw new Error('No instructions have been set yet.');
      }
      // Canonical text is already written at the default level; only other
      // grades pay for a rewrite.
      let leveled = canonical;
      if (grade !== DEFAULT_INSTRUCTIONS_GRADE) {
        const {output} = await generateText({
          model: getModel(AiChatModelIds.GEMINI_2_5_FLASH_LITE),
          messages: [
            {
              role: 'user',
              content:
                `Rewrite these student instructions for a ${grade} reading ` +
                `level. Keep the meaning, keep roughly the same length, ` +
                `plain text only.\n\nTitle: ${canonical.title}\n` +
                `Body: ${canonical.body}`,
            },
          ],
          output: relevelOutput,
        });
        if (output) {
          leveled = output;
        }
      }
      return {
        content: [{type: 'text', text: `Instructions releveled for ${grade}.`}],
        structuredContent: leveled,
      };
    }
  );

  server.registerResource(
    'instructions-widget',
    INSTRUCTIONS_WIDGET_URI,
    {
      description: 'Persistent instructions panel with a grade selector',
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
