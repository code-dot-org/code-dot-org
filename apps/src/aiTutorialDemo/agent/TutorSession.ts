import {CallToolResult} from '@modelcontextprotocol/sdk/types.js';
import {Output, type ModelMessage} from 'ai';
import {z} from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {WidgetSlot} from '../mcp/constants';
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
  stageWidget: ActiveWidget | null;
  instructionsWidget: ActiveWidget | null;
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
  private widgets: Record<WidgetSlot, ActiveWidget | null> = {
    stage: null,
    instructions: null,
  };
  private busy = false;
  private nextId = 1;
  private pendingEvents: string[] = [];
  private eventTimer: ReturnType<typeof setTimeout> | null = null;
  private turnQueued = false;
  private disposed = false;
  private readonly systemPrompt: string;
  private readonly replyOutput: ReturnType<typeof buildReplyOutput>;

  constructor(
    private runtime: McpHostRuntime,
    private onChange: (snapshot: TutorSnapshot) => void,
    private gradeLabel: string
  ) {
    // App-only tools (e.g. the instructions plugin's releveler) are the
    // widgets' business: the model never hears about them and can't name
    // them in a toolCall.
    const modelTools = runtime.tools.filter(tool =>
      tool.visibility.includes('model')
    );
    const toolNames = modelTools.map(tool => tool.name);
    if (toolNames.length === 0) {
      throw new Error('TutorSession needs at least one model-visible tool');
    }
    this.systemPrompt = buildSystemPrompt(modelTools);
    this.replyOutput = buildReplyOutput(toolNames as [string, ...string[]]);
  }

  /**
   * Detach from the page (used by restart). In-flight gateway calls may
   * still resolve afterwards; the disposed flag keeps them from writing
   * into the replacement session's UI.
   */
  dispose() {
    this.disposed = true;
    if (this.eventTimer) {
      clearTimeout(this.eventTimer);
      this.eventTimer = null;
    }
  }

  private emit() {
    if (this.disposed) {
      return;
    }
    this.onChange({
      items: [...this.items],
      busy: this.busy,
      stageWidget: this.widgets.stage,
      instructionsWidget: this.widgets.instructions,
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
        `[session_start] The student just opened the page. The student is ` +
        `in ${this.gradeLabel}. Greet them and begin the lesson.`,
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
    if (this.disposed) {
      return;
    }
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
        const renderedSlot = await this.dispatchToolCall(
          output.toolCall.name,
          output.toolCall.argumentsJson
        );
        // Presenting an activity ends the turn — the student acts next.
        // (Looping unconditionally once let the model chain chart →
        // question → editor with no student input in between.) Updating the
        // passive instructions strip does not end the turn, so the model
        // can set instructions and then present the activity; failed calls
        // also continue, for a retry within the cap.
        if (renderedSlot === 'stage') {
          break;
        }
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

  /** Returns the slot the call rendered into, or null if nothing rendered. */
  private async dispatchToolCall(
    name: string,
    argumentsJson: string
  ): Promise<WidgetSlot | null> {
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(argumentsJson || '{}');
    } catch {
      this.transcript.push({
        role: 'user',
        content: `[tool_result for ${name}] Error: argumentsJson was not valid JSON.`,
      });
      return null;
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
      return null;
    }
    const tool = this.runtime.getTool(name);
    const template = tool?.uiResourceUri
      ? this.runtime.getTemplate(tool.uiResourceUri)
      : undefined;
    if (template && tool) {
      // Feedback is about an attempt at the current activity; when the
      // stage switches to a different tool it goes stale, and clearing it
      // is host policy rather than model discipline. Same-tool re-presents
      // keep it — the arc's feedback moments re-present the same tool.
      if (
        tool.slot === 'stage' &&
        this.widgets.stage &&
        this.widgets.stage.toolName !== name
      ) {
        await this.clearPanelFeedback();
      }
      this.widgets[tool.slot] = {
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
    return template && tool ? tool.slot : null;
  }

  /**
   * Host-initiated call to the instructions plugin; deliberately not
   * recorded in the model transcript — the model didn't ask for it, and
   * set_feedback's description tells it clears happen on tool switches.
   */
  private async clearPanelFeedback() {
    const tool = this.runtime.getTool('clear_feedback');
    if (!tool || !this.widgets.instructions) {
      return;
    }
    try {
      const result = await this.runtime.callTool('clear_feedback', {});
      // Same callId on purpose: the frame re-delivers on the changed
      // toolResult, but a clear is not new content and must not re-reveal
      // a panel the student hid.
      this.widgets.instructions = {
        ...this.widgets.instructions,
        toolResult: result,
      };
      this.emit();
    } catch (error) {
      // A stale validation is cosmetic; never fail the activity change.
      console.warn('clear_feedback failed:', error);
    }
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
    case 'grade_level_changed':
      return 'You changed the grade level';
    default:
      return 'Widget update sent to tutor';
  }
}
