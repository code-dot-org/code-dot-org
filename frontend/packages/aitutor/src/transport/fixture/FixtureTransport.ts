// A transport that answers from a recording.
//
// No network, no key, no clock it does not own. Two consumers, and they are the
// reason this comes before any UI (specs/PLAN.md §6):
//
//   - Tests. Real components, real store, fake transport. Every failure branch
//     in the panel is reachable, which is not true of a mocked `fetch`.
//   - The demo page. The panel, standing alone, for anyone reviewing it who
//     cannot get a model credential.
//
// It is a pure function of its transcript plus a turn counter. `now` and `sleep`
// are injected so a test need not own the clock, and so that a scripted delay —
// which is what makes the waiting state visible on the demo page — costs a test
// nothing.

import {
  type CompletedMessage,
  type PendingMessage,
  Role,
} from '../../model/messages';
import {AiInteractionStatus, type CompletedStatus} from '../../model/status';
import type {TutorReply, TutorRequest, TutorTransport} from '../types';

import {
  matches,
  type FixtureReply,
  type FixtureTurn,
  type Transcript,
} from './transcript';

/** Nothing in the transcript answers this, and there is no fallback. */
export class FixtureExhausted extends Error {
  constructor(text: string, at: number) {
    super(
      `fixture has no turn for request ${at}: ${JSON.stringify(text)}. ` +
        'Add a matching turn, or give the transcript a `fallback`.',
    );
    this.name = 'FixtureExhausted';
  }
}

export interface FixtureTransportOptions {
  /** Defaults to `Date.now`. */
  now?: () => number;
  /** Defaults to `setTimeout`, cancellable by the request's signal. */
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  /** The id given to the first message. Defaults to 1. */
  firstRequestId?: number;
}

const wait = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(signal?.reason);
    }
    signal?.addEventListener('abort', onAbort, {once: true});
  });

/** Never settles, except by abort. */
const hang = (signal?: AbortSignal): Promise<never> =>
  new Promise<never>((_resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    signal?.addEventListener('abort', () => reject(signal.reason), {
      once: true,
    });
  });

export class FixtureTransport implements TutorTransport {
  private readonly transcript: Transcript;
  private readonly now: () => number;
  private readonly sleep: (ms: number, signal?: AbortSignal) => Promise<void>;

  /** How many requests have been made — what a `turn` matcher counts. */
  private at = 0;
  /** Which turns have already answered. A turn answers at most once. */
  private readonly spent = new Set<number>();
  private nextRequestId: number;

  constructor(transcript: Transcript, options: FixtureTransportOptions = {}) {
    this.transcript = transcript;
    this.now = options.now ?? (() => Date.now());
    this.sleep = options.sleep ?? wait;
    this.nextRequestId = options.firstRequestId ?? 1;
  }

  /** Forget which turns have answered, as though the session were new. */
  reset(): void {
    this.at = 0;
    this.spent.clear();
  }

  async complete(
    request: TutorRequest,
    signal?: AbortSignal,
  ): Promise<TutorReply> {
    const at = this.at++;
    const text = request.message.chatMessageText;
    const found = this.find(text, at);

    if (found === undefined) {
      if (this.transcript.fallback === undefined) {
        throw new FixtureExhausted(text, at);
      }
      return this.answer(request, this.transcript.fallback);
    }

    this.spent.add(found.index);
    const {turn} = found;
    if (turn.hang) {
      await hang(signal);
    }
    if (turn.delayMs) {
      await this.sleep(turn.delayMs, signal);
    }
    signal?.throwIfAborted();
    return this.answer(request, turn.reply);
  }

  /**
   * The first unspent turn that applies.
   *
   * In declaration order, which is what gives a matcher-free transcript its
   * sequence: turn zero is the only unspent turn that matches everything, then
   * turn one, and so on.
   */
  private find(
    text: string,
    at: number,
  ): {turn: FixtureTurn; index: number} | undefined {
    for (let index = 0; index < this.transcript.turns.length; index++) {
      if (this.spent.has(index)) {
        continue;
      }
      const turn = this.transcript.turns[index];
      if (matches(turn.when, text, at)) {
        return {turn, index};
      }
    }
    return undefined;
  }

  private answer(request: TutorRequest, reply: FixtureReply): TutorReply {
    const timestamp = this.now();
    const userStatus = (reply.userStatus ??
      AiInteractionStatus.OK) as CompletedStatus;

    const user = this.settle(request.message, userStatus, timestamp);

    // A failed user turn never reached a model, so there is nothing for the
    // assistant to have said. This is the shape the real profanity path
    // produces, and the only way to reach that UI without a server.
    if (userStatus !== AiInteractionStatus.OK) {
      return {messages: [user]};
    }

    const assistant: CompletedMessage = {
      role: Role.ASSISTANT,
      status: (reply.status ?? AiInteractionStatus.OK) as CompletedStatus,
      chatMessageText: reply.text ?? '',
      chatMessageDisplayText: reply.displayText,
      structuredOutput: reply.structured,
      requestId: this.nextRequestId++,
      timestamp,
    };

    return {
      messages: [user, assistant],
      structuredOutput: reply.structured,
    };
  }

  /** The student's own message, echoed with an id and a settled status. */
  private settle(
    message: PendingMessage,
    status: CompletedStatus,
    timestamp: number,
  ): CompletedMessage {
    return {
      ...message,
      status,
      requestId: this.nextRequestId++,
      timestamp,
    };
  }
}
