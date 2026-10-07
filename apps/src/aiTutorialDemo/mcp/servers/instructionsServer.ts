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

const FEEDBACK_KINDS = ['validation', 'suggestion', 'correction'] as const;

type Feedback = {
  kind: (typeof FEEDBACK_KINDS)[number];
  text: string;
};

// Type aliases (not interfaces) so these satisfy the SDK's structuredContent
// index-signature check.
type PanelState = {
  title: string;
  body: string;
  feedback: Feedback | null;
};

// Both panel tools return the complete panel state, and the view renders
// only from it — with two writers (instructions and feedback) that beats
// having the view reverse-engineer state from per-tool inputs.
const panelOutputSchema = {
  title: z.string(),
  body: z.string(),
  feedback: z
    .object({kind: z.enum(FEEDBACK_KINDS), text: z.string()})
    .nullable(),
};

// The releveler rewrites everything currently on the panel in one call.
// feedbackText is an empty string when there is no feedback (a required
// field survives strict structured-output schemas better than an optional
// one).
const relevelOutput = Output.object({
  schema: zV3.object({
    title: zV3.string(),
    body: zV3.string(),
    feedbackText: zV3.string(),
  }),
});

// MCP Apps server for the persistent instructions strip — and the demo's
// example of a plugin with capability of its own. The tutor writes
// canonical text (instructions per step, feedback per attempt); the widget
// owns a grade dropdown and calls relevel_instructions — visible to the app
// only, never to the model — to rewrite the stored canonical text for the
// selected grade. The rewrite goes through the AI gateway on a small model;
// a real third-party plugin would make the same call against its own
// backend. Grade changes also reach the tutor, but as a widget event the
// widget emits, not through this server.
export function createInstructionsServer(): McpServer {
  const server = new McpServer({
    name: 'instructions-server',
    version: '0.3.0',
  });

  const canonical: PanelState = {title: '', body: '', feedback: null};

  server.registerTool(
    'set_instructions',
    {
      description:
        'Update the instructions panel that stays visible above the ' +
        'activity area. Write the text once, in plain neutral language at ' +
        'about a grade 5 reading level — the panel itself rewrites it for ' +
        'the grade level the student selects, so never re-send ' +
        'instructions just because the grade changed. It replaces the ' +
        'previous instructions, clears any feedback, and never touches the ' +
        'activity. Update it whenever the goal changes — typically right ' +
        'before presenting a new activity.',
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
      outputSchema: panelOutputSchema,
      _meta: {
        ui: {
          resourceUri: INSTRUCTIONS_WIDGET_URI,
          visibility: ['model'],
          slot: 'instructions',
        },
      },
    },
    async input => {
      canonical.title = input.title;
      canonical.body = input.body;
      // A new step makes feedback about the previous attempt stale.
      canonical.feedback = null;
      return {
        content: [{type: 'text', text: 'Instructions panel updated.'}],
        structuredContent: {...canonical},
      };
    }
  );

  server.registerTool(
    'set_feedback',
    {
      description:
        "Show feedback under the instructions, for when the student's " +
        'latest attempt should not advance the lesson: kind "validation" ' +
        'confirms what they got right, "suggestion" nudges a next thing to ' +
        'try, "correction" points out what to fix. One or two plain ' +
        'sentences at about a grade 5 reading level (the panel relevels it ' +
        'with the instructions). Replaces earlier feedback; instructions ' +
        'and the activity stay as they are. Cleared automatically by the ' +
        'next set_instructions, and when the activity switches to a ' +
        'different tool.',
      inputSchema: {
        kind: z
          .enum(FEEDBACK_KINDS)
          .describe('validation, suggestion, or correction'),
        text: z.string().describe('The feedback, one or two sentences'),
      },
      outputSchema: panelOutputSchema,
      _meta: {
        ui: {
          resourceUri: INSTRUCTIONS_WIDGET_URI,
          visibility: ['model'],
          slot: 'instructions',
        },
      },
    },
    async input => {
      canonical.feedback = {kind: input.kind, text: input.text};
      return {
        content: [{type: 'text', text: 'Feedback shown to the student.'}],
        structuredContent: {...canonical},
      };
    }
  );

  server.registerTool(
    'clear_feedback',
    {
      description:
        'Clear the feedback section, leaving the instructions as they are. ' +
        'Called by the host when the activity switches to a different tool, ' +
        'so feedback about one activity never lingers next to another; not ' +
        'available to the model.',
      inputSchema: {},
      outputSchema: panelOutputSchema,
      _meta: {
        ui: {
          resourceUri: INSTRUCTIONS_WIDGET_URI,
          visibility: ['app'],
          slot: 'instructions',
        },
      },
    },
    async () => {
      canonical.feedback = null;
      return {
        content: [{type: 'text', text: 'Feedback cleared.'}],
        structuredContent: {...canonical},
      };
    }
  );

  server.registerTool(
    'relevel_instructions',
    {
      description:
        'Rewrite the current panel (instructions and any feedback) for a ' +
        'grade level. Called by the instructions view when the student ' +
        'changes the grade dropdown; not available to the model.',
      inputSchema: {
        grade: z
          .string()
          .describe('Target level, e.g. "grade 3" or "high school"'),
      },
      outputSchema: panelOutputSchema,
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
      if (!canonical.title && !canonical.body) {
        throw new Error('No instructions have been set yet.');
      }
      // Canonical text is already written at the default level; only other
      // grades pay for a rewrite.
      let leveled: PanelState = {...canonical};
      if (grade !== DEFAULT_INSTRUCTIONS_GRADE) {
        const feedbackLine = canonical.feedback
          ? `\nFeedback: ${canonical.feedback.text}`
          : '\nFeedback: (none — return an empty string for feedbackText)';
        const {output} = await generateText({
          model: getModel(AiChatModelIds.GEMINI_2_5_FLASH_LITE),
          messages: [
            {
              role: 'user',
              content:
                `Rewrite these student instructions for a ${grade} reading ` +
                `level. Keep the meaning, keep roughly the same length, ` +
                `plain text only.\n\nTitle: ${canonical.title}\n` +
                `Body: ${canonical.body}${feedbackLine}`,
            },
          ],
          output: relevelOutput,
        });
        if (output) {
          leveled = {
            title: output.title,
            body: output.body,
            feedback:
              canonical.feedback && output.feedbackText
                ? {kind: canonical.feedback.kind, text: output.feedbackText}
                : canonical.feedback,
          };
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
      description:
        'Persistent instructions panel with feedback and a grade selector',
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
