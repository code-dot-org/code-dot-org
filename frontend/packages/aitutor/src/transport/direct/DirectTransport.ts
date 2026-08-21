// A transport that talks to the dev proxy, which talks to a real model.
//
// The third of the four in specs/PLAN.md §4, and the only one that produces an
// answer nobody wrote. It knows nothing about any provider: it posts this
// package's own shape to this page's own origin, and the plugin on the other
// end does the translating (`dev/protocol`).
//
// FOR DEVELOPMENT. It reaches a model with none of the moderation the dashboard
// path applies, so it is not a thing to point at students. `DashboardTransport`
// is (specs/PLAN.md §7, §12).

import {
  COMPLETE_ROUTE,
  STATUS_ROUTE,
  type ProxyReply,
  type ProxyStatus,
} from '../../dev/protocol';
import {Role, type CompletedMessage} from '../../model/messages';
import {AiInteractionStatus, type CompletedStatus} from '../../model/status';
import type {TutorReply, TutorRequest, TutorTransport} from '../types';

export interface DirectTransportOptions {
  /** Overrides the proxy's own default model. */
  model?: string;
  /** Defaults to `globalThis.fetch`. */
  fetchImpl?: typeof fetch;
  /** The id given to the first message. Defaults to 1. */
  firstRequestId?: number;
}

/**
 * Whether a proxy is answering on this origin.
 *
 * Asked BEFORE the student says anything, so a page can offer a recording
 * instead. A live transport that fails on first use looks like a broken tutor;
 * a missing key should look like a missing key.
 */
export const proxyStatus = async (
  fetchImpl: typeof fetch = fetch,
): Promise<ProxyStatus> => {
  try {
    const response = await fetchImpl(STATUS_ROUTE);
    if (!response.ok) {
      return {
        available: false,
        reason: `status route answered ${response.status}`,
      };
    }
    return (await response.json()) as ProxyStatus;
  } catch (error) {
    return {available: false, reason: (error as Error).message};
  }
};

export class DirectTransport implements TutorTransport {
  private readonly model?: string;
  private readonly fetchImpl: typeof fetch;
  private nextRequestId: number;

  constructor(options: DirectTransportOptions = {}) {
    this.model = options.model;
    this.fetchImpl = options.fetchImpl ?? ((...args) => fetch(...args));
    this.nextRequestId = options.firstRequestId ?? 1;
  }

  async complete(
    request: TutorRequest,
    signal?: AbortSignal,
  ): Promise<TutorReply> {
    // The context goes in the SYSTEM prompt, not the turn, which is where the
    // legacy puts it too (`formatSystemMessages`). In the turn it would be part
    // of the conversation, repeated every time the project changed, and shown
    // to the model as though the student had said it.
    const system = [request.systemPrompt, request.hiddenContext]
      .filter(Boolean)
      .join('\n\n');

    const response = await this.fetchImpl(COMPLETE_ROUTE, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      signal,
      body: JSON.stringify({
        messages: [
          ...request.history.map(message => ({
            role: message.role === Role.ASSISTANT ? 'assistant' : 'user',
            text: message.chatMessageText,
          })),
          {role: 'user', text: request.message.chatMessageText},
        ],
        system: system || undefined,
        model: this.model,
        responseSchema: request.responseSchema,
      }),
    });

    if (!response.ok) {
      // The proxy answers 200 even for a failed turn, so a non-200 is the
      // route itself being wrong — not running, or not this origin.
      throw new Error(`AI Tutor proxy answered ${response.status}`);
    }

    const reply = (await response.json()) as ProxyReply;
    const timestamp = Date.now();

    const user: CompletedMessage = {
      ...request.message,
      status: AiInteractionStatus.OK,
      requestId: this.nextRequestId++,
      timestamp,
    };
    const assistant: CompletedMessage = {
      role: Role.ASSISTANT,
      status: (reply.failure ?? AiInteractionStatus.OK) as CompletedStatus,
      chatMessageText: reply.text,
      structuredOutput: reply.structured,
      requestId: this.nextRequestId++,
      timestamp,
    };

    return {
      messages: [user, assistant],
      structuredOutput: reply.structured,
    };
  }
}
