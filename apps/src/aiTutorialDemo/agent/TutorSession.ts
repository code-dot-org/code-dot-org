import {CallToolResult} from '@modelcontextprotocol/sdk/types.js';
import {Output, type ModelMessage} from 'ai';
import {z} from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {McpHostRuntime} from '../mcp/hostRuntime';

import {buildSystemPrompt} from './systemPrompt';

export type ChatItem =
  | {id: number; kind: 'message'; role: 'user' | 'assistant'; text: string}
  | {id: number; kind: 'status'; text: string};

export interface ActiveWidget {
  callId: number;
  toolName: string;
  html: string;
  toolInput: Record<string, unknown>;
  toolResult: CallToolResult;
}

export interface TutorSnapshot {
  items: ChatItem[];
  busy: boolean;
  widget: ActiveWidget | null;
}

// How the model asks for a tool. The gateway supports structured outputs but
// not native tool calling, so this schema is the host's tool-call encoding:
// arguments ride as a JSON string because the real per-tool schemas can't be
// unioned into one structured-output schema.
function buildReplyOutput(toolNames: [string, ...string[]]) {
  return Output.object({
    schema: z.object({
      message: z
        .string()
        .describe(
          'Markdown shown to the student. Empty string if the tool call ' +
            'speaks for itself.'
        ),
      toolCall: z
        .object({
          name: z.enum(toolNames),
          argumentsJson: z
            .string()
            .describe(
              'JSON object literal matching the tool input schema, as a string'
            ),
        })
        .nullable()
        .describe('Widget tool to invoke after the message, or null'),
    }),
  });
}

// Ceiling on model calls per student action. A tool call consumes one
// iteration; the loop usually ends after two (call, then comment on result).
const MAX_MODEL_CALLS_PER_TURN = 4;

// Chart drags arrive in bursts; wait for the student to settle before
// spending a model turn. Submits and code runs flush immediately.
const WIDGET_EVENT_DEBOUNCE_MS = 1000;

/**
 * The agent loop: owns the chat transcript, calls the AI gateway, and
 * dispatches the model's tool calls through the MCP host runtime. Widget
 * events (student interactions) come in via notifyWidgetEvent and are folded
 * into the transcript as bracketed user-role messages.
 */
export class TutorSession {
  private items: ChatItem[] = [];
  private transcript: ModelMessage[] = [];
  private widget: ActiveWidget | null = null;
  private busy = false;
  private nextId = 1;
  private pendingEvents: string[] = [];
  private eventTimer: ReturnType<typeof setTimeout> | null = null;
  private turnQueued = false;
  private readonly systemPrompt: string;
  private readonly replyOutput: ReturnType<typeof buildReplyOutput>;

  constructor(
    private runtime: McpHostRuntime,
    private onChange: (snapshot: TutorSnapshot) => void
  ) {
    const toolNames = runtime.tools.map(tool => tool.name);
    if (toolNames.length === 0) {
      throw new Error('TutorSession needs at least one MCP tool');
    }
    this.systemPrompt = buildSystemPrompt(runtime.tools);
    this.replyOutput = buildReplyOutput(toolNames as [string, ...string[]]);
  }

  private emit() {
    this.onChange({
      items: [...this.items],
      busy: this.busy,
      widget: this.widget,
    });
  }

  private pushItem(
    item:
      | {kind: 'message'; role: 'user' | 'assistant'; text: string}
      | {kind: 'status'; text: string}
  ) {
    this.items.push({...item, id: this.nextId++});
    this.emit();
  }

  /** Kick off the lesson: the model greets and typically opens a widget. */
  start() {
    this.transcript.push({
      role: 'user',
      content:
        '[session_start] The student just opened the page. Greet them and ' +
        'begin the lesson.',
    });
    this.runTurn();
  }

  sendStudentMessage(text: string) {
    this.pushItem({kind: 'message', role: 'user', text});
    this.transcript.push({role: 'user', content: text});
    this.runTurn();
  }

  /** Called by WidgetFrame when a widget reports student activity. */
  notifyWidgetEvent(update: {content?: unknown; structuredContent?: unknown}) {
    const structured = update.structuredContent as {type?: string} | undefined;
    this.pushItem({
      kind: 'status',
      text: widgetEventCaption(structured?.type),
    });
    this.pendingEvents.push(
      `[widget_event] ${JSON.stringify(
        update.structuredContent ?? update.content
      )}`
    );
    const immediate = structured?.type !== 'chart_values_changed';
    if (this.eventTimer) {
      clearTimeout(this.eventTimer);
    }
    if (immediate) {
      this.flushEvents();
    } else {
      this.eventTimer = setTimeout(
        () => this.flushEvents(),
        WIDGET_EVENT_DEBOUNCE_MS
      );
    }
  }

  private flushEvents() {
    this.eventTimer = null;
    if (!this.pendingEvents.length) {
      return;
    }
    for (const event of this.pendingEvents) {
      this.transcript.push({role: 'user', content: event});
    }
    this.pendingEvents = [];
    this.runTurn();
  }

  private async runTurn() {
    if (this.busy) {
      // A turn is streaming already; run once more when it finishes so the
      // transcript entries just added get a response.
      this.turnQueued = true;
      return;
    }
    this.busy = true;
    this.emit();
    try {
      for (let i = 0; i < MAX_MODEL_CALLS_PER_TURN; i++) {
        const {output} = await generateText({
          model: getModel(AiChatModelIds.GEMINI_2_5_FLASH),
          messages: [
            {role: 'system', content: this.systemPrompt},
            ...this.transcript,
          ],
          output: this.replyOutput,
        });
        if (!output) {
          throw new Error('Gateway returned no structured output');
        }
        // The assistant turn is stored as its raw JSON so the model sees its
        // own past tool calls verbatim on later turns.
        this.transcript.push({
          role: 'assistant',
          content: JSON.stringify(output),
        });
        if (output.message) {
          this.pushItem({
            kind: 'message',
            role: 'assistant',
            text: output.message,
          });
        }
        if (!output.toolCall) {
          break;
        }
        await this.dispatchToolCall(
          output.toolCall.name,
          output.toolCall.argumentsJson
        );
      }
    } catch (error) {
      console.error('AI tutorial demo turn failed:', error);
      this.pushItem({
        kind: 'status',
        text: 'The AI request failed. Send a message to try again.',
      });
    } finally {
      this.busy = false;
      this.emit();
      if (this.turnQueued) {
        this.turnQueued = false;
        this.runTurn();
      }
    }
  }

  private async dispatchToolCall(name: string, argumentsJson: string) {
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(argumentsJson || '{}');
    } catch {
      this.transcript.push({
        role: 'user',
        content: `[tool_result for ${name}] Error: argumentsJson was not valid JSON.`,
      });
      return;
    }
    this.pushItem({kind: 'status', text: `Tutor is using ${name}`});
    let result: CallToolResult;
    try {
      result = await this.runtime.callTool(name, args);
    } catch (error) {
      this.transcript.push({
        role: 'user',
        content: `[tool_result for ${name}] Error: ${String(error)}`,
      });
      return;
    }
    const tool = this.runtime.getTool(name);
    const template = tool?.uiResourceUri
      ? this.runtime.getTemplate(tool.uiResourceUri)
      : undefined;
    if (template) {
      this.widget = {
        callId: this.nextId++,
        toolName: name,
        html: template,
        toolInput: args,
        toolResult: result,
      };
      this.emit();
    }
    this.transcript.push({
      role: 'user',
      content: `[tool_result for ${name}] ${JSON.stringify(result.content)}`,
    });
  }
}

function widgetEventCaption(type?: string): string {
  switch (type) {
    case 'choice_submitted':
      return 'You submitted an answer';
    case 'code_run':
      return 'You ran your code';
    case 'chart_values_changed':
      return 'You changed the chart';
    default:
      return 'Widget update sent to tutor';
  }
}
