// The transport that studio uses.
//
// The fourth of the four (specs/PLAN.md §4), and the only one that is not a
// request and a response: a completion is QUEUED. The server answers with an
// id and how often to ask about it, and the caller asks until it is done —
// which is why the polling loop is here rather than in
// `@code-dot-org/core/api`, where the two calls live. How long to wait, and
// what a timeout means, are decisions about a conversation and not about HTTP.
//
// Ported from `postAichatCompletionMessage` in `apps/src/aichat/aichatApi.ts`,
// including the backoff and the floor under the interval. Everything the legacy
// read from redux — the level, the script, the channel — arrives in
// `TutorRequest.session`, put there by the host.

import {
  AiChatReadTimeouts,
  DashboardApiClient,
  type AiChatClientType,
} from '@code-dot-org/core/api';

import {Role, type CompletedMessage} from '../../model/messages';
import {AiInteractionStatus} from '../../model/status';
import type {TutorReply, TutorRequest, TutorTransport} from '../types';

import {messagesFor, stillRunning} from './executionStatus';

/** However eager the server is, do not ask more than once a second. */
const MIN_POLLING_INTERVAL_MS = 1000;
/** What to multiply the interval by when the server does not say. */
const DEFAULT_BACKOFF_RATE = 1;
/**
 * How much longer than the server's own timeout to wait before giving up.
 *
 * The legacy's `* 1500` — the server states its timeout in SECONDS, so this is
 * a conversion to milliseconds and a 50% margin in one number. Split here so
 * neither half is mistaken for the other.
 */
const SECONDS_TO_MS = 1000;
const TIMEOUT_MARGIN = 1.5;

export interface DashboardTransportOptions {
  /** Defaults to the shared `DashboardApiClient`. */
  api?: Pick<typeof DashboardApiClient, 'aichat'>['aichat'];
  /** Defaults to the client type's own server-side timeout, plus a margin. */
  maxPollingTimeMs?: number;
  /** Defaults to `setTimeout`; injected so a test need not own the clock. */
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export class DashboardTransport implements TutorTransport {
  private readonly api: DashboardTransportOptions['api'];
  private readonly maxPollingTimeMs?: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;

  constructor(options: DashboardTransportOptions = {}) {
    this.api = options.api ?? DashboardApiClient.aichat;
    this.maxPollingTimeMs = options.maxPollingTimeMs;
    this.sleep = options.sleep ?? wait;
    this.now = options.now ?? (() => Date.now());
  }

  async complete(
    request: TutorRequest,
    signal?: AbortSignal,
  ): Promise<TutorReply> {
    const clientType = (request.session.clientType ??
      'ai-tutor') as AiChatClientType;

    const {requestId, pollingIntervalMs, backoffRate} =
      await this.api!.startChatCompletion({
        newMessage: request.message,
        // Already filtered to `OK` by the caller; the server stores what it is
        // given and a failed turn is not part of the conversation the model has
        // been having.
        storedMessages: [...request.history],
        modelParameters: {
          selectedModelId: request.session.modelId,
          systemPrompt: request.systemPrompt,
          responseJsonSchema: request.responseSchema,
        },
        aichatContext: {
          clientType,
          currentLevelId: request.session.levelId,
          scriptId: request.session.scriptId,
          channelId: request.session.channelId,
          lessonId: request.session.lessonId,
        },
      });

    const deadline =
      this.maxPollingTimeMs ??
      AiChatReadTimeouts[clientType] * SECONDS_TO_MS * TIMEOUT_MARGIN;
    const startedAt = this.now();
    const rate = backoffRate || DEFAULT_BACKOFF_RATE;

    let interval = Math.max(pollingIntervalMs, MIN_POLLING_INTERVAL_MS);
    let executionStatus = 0;
    let answerText = '';

    // Waits BEFORE the first poll, as the legacy does: the server has only just
    // been handed the work, and asking immediately is one request that is
    // certain to say "not started".
    while (stillRunning(executionStatus) && this.now() - startedAt < deadline) {
      await this.sleep(interval);
      signal?.throwIfAborted();
      const polled = await this.api!.getChatRequest({requestId});
      executionStatus = polled.executionStatus;
      answerText = polled.response;
      interval *= rate;
    }

    if (stillRunning(executionStatus)) {
      // Distinct from the server saying it timed out, which arrives as a status
      // and renders as a failed turn. This one is the client giving up, and the
      // caller settles the question as an error (`useTutor`).
      throw new Error('Chat completion request timed out (client side)');
    }

    const messages: CompletedMessage[] = messagesFor(
      request.message,
      answerText,
      executionStatus,
    ).map(message => ({...message, requestId}));

    // The structured answer, when one was asked for. The server hands back the
    // model's text; if it was schema-constrained, that text is the JSON.
    let structuredOutput: unknown;
    if (request.responseSchema) {
      const answer = messages.find(
        message =>
          message.role === Role.ASSISTANT &&
          message.status === AiInteractionStatus.OK,
      );
      if (answer?.chatMessageText) {
        try {
          structuredOutput = JSON.parse(answer.chatMessageText);
          answer.structuredOutput = structuredOutput;
        } catch {
          // A model that ignored its schema. Better a plain answer the student
          // can read than a turn that vanishes.
        }
      }
    }

    return {messages, structuredOutput};
  }
}
