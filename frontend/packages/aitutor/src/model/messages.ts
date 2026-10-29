// What a conversation is made of.
//
// Ported from `apps/src/aichat/types/chatEvents.ts`, which is sound and worth
// keeping recognisable: three message shapes discriminated by `status`, a
// display text that differs from the sent text only when something was appended
// for the model's benefit, and a hidden context that is neither shown nor
// stored. Two things are dropped here and one is tightened.
//
// DROPPED: `ServerChatEvent` and the teacher-feedback fields. Both are shaped by
// a table this package cannot see, and both belong to the chat-history feature
// that is out of scope (specs/PLAN.md §2, §12).
//
// TIGHTENED: `updateId` is required on a pending message rather than optional
// on all of them. It is the handle the store uses to replace a message in place
// when the answer lands, so a pending message without one cannot be completed —
// which the legacy code acknowledged by writing `PendingChatMessage & {updateId:
// string}` at the one place it made them.

import {AiInteractionStatus} from './status';
import type {CompletedStatus} from './status';

/**
 * Who said it.
 *
 * A const object rather than the `enum` the legacy type uses: this workspace
 * compiles with `erasableSyntaxOnly`, under which an `enum` is not erasable
 * syntax. The values are identical, so a message crossing between the two
 * worlds needs no translation.
 */
export const Role = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

interface BaseMessage {
  /** UTC milliseconds. */
  timestamp: number;

  /**
   * What goes to the model, and what is shown when `chatMessageDisplayText` is
   * absent.
   */
  chatMessageText: string;

  /**
   * What is shown, when that differs from what was sent.
   *
   * They differ when the panel appends something the student did not type — a
   * file selection, say. Showing the appended form would be showing the student
   * words they did not write; sending the bare form would be sending the model
   * less than it was promised.
   */
  chatMessageDisplayText?: string;

  /**
   * Project context prepended to the request. Not shown, not kept in history.
   *
   * Assembled by the host, because only the host knows what a project is
   * (specs/PLAN.md §3).
   */
  hiddenContext?: string;

  role: Role;
  status: AiInteractionStatus;
}

/** Sent, unanswered. `updateId` is how the answer finds it again. */
export interface PendingMessage extends BaseMessage {
  status: typeof AiInteractionStatus.UNKNOWN;
  updateId: string;
}

/** Answered, however it ended. `requestId` is the transport's identity for it. */
export interface CompletedMessage extends BaseMessage {
  requestId: number;
  status: CompletedStatus;
  updateId?: string;

  /**
   * The reply, already parsed, when the request carried a response schema.
   *
   * Parsed ONCE, by the transport, so that nothing downstream re-parses
   * `chatMessageText` and nothing has to decide whether a given string is JSON.
   * Absent on every unstructured turn, which is most of them.
   */
  structuredOutput?: unknown;
}

export type ChatMessage = PendingMessage | CompletedMessage;

export const isPendingMessage = (
  message: ChatMessage,
): message is PendingMessage =>
  (message as CompletedMessage).requestId === undefined;

export const isCompletedMessage = (
  message: ChatMessage,
): message is CompletedMessage =>
  (message as CompletedMessage).requestId !== undefined;
