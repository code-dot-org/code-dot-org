// What the server's verdict means for the two messages on screen.
//
// A verbatim port of `getUpdatedMessages` in `apps/src/aichat/aichatApi.ts`,
// and the part of the dashboard path most worth having on its own: it is a
// fourteen-way mapping from one number to which messages exist and what status
// each carries, and every arm of it is a different thing the student sees.
//
// The asymmetries are the legacy's and they are deliberate:
//
//   - A REJECTED QUESTION produces one message, not two. The model was never
//     called, so there is nothing for it to have said.
//   - A REJECTED ANSWER produces two, and the question is marked `ERROR` rather
//     than with the reason — the student's question was fine; it was the answer
//     that was not.
//   - A TIMEOUT and a RATE LIMIT mark BOTH messages with the same status. The
//     turn did not happen at all, and neither half of it stands.

import {AiRequestExecutionStatus} from '@code-dot-org/core/api';

import {
  Role,
  type CompletedMessage,
  type PendingMessage,
} from '../../model/messages';
import {AiInteractionStatus, type CompletedStatus} from '../../model/status';

/** A message the server produced, before an id is put on it. */
type Unnumbered = Omit<CompletedMessage, 'requestId'>;

const assistant = (text: string, status: CompletedStatus): Unnumbered => ({
  role: Role.ASSISTANT,
  chatMessageText: text,
  timestamp: Date.now(),
  status,
});

/**
 * Whether the server is still working on it.
 *
 * The one place the ordering of `AiRequestExecutionStatus` is relied on:
 * everything below `SUCCESS` means not finished. The failures start at 1000.
 */
export const stillRunning = (status: number): boolean =>
  status < AiRequestExecutionStatus.SUCCESS;

export const messagesFor = (
  question: PendingMessage,
  answerText: string,
  executionStatus: number,
): Unnumbered[] => {
  const settled = (status: CompletedStatus): Unnumbered => ({
    ...question,
    status,
  });

  switch (executionStatus) {
    case AiRequestExecutionStatus.SUCCESS:
      return [
        settled(AiInteractionStatus.OK),
        assistant(answerText, AiInteractionStatus.OK),
      ];

    // The model was never called, so there is no answer to show.
    case AiRequestExecutionStatus.USER_PROFANITY:
      return [settled(AiInteractionStatus.PROFANITY_VIOLATION)];
    case AiRequestExecutionStatus.USER_PII:
      return [settled(AiInteractionStatus.PII_VIOLATION)];

    // The question was fine; the answer was not. So the question is marked
    // `ERROR` — it produced nothing — and the reason goes on the answer.
    case AiRequestExecutionStatus.MODEL_PROFANITY:
      return [
        settled(AiInteractionStatus.ERROR),
        assistant(answerText, AiInteractionStatus.PROFANITY_VIOLATION),
      ];
    case AiRequestExecutionStatus.FAILURE:
    case AiRequestExecutionStatus.MODEL_PII:
      return [
        settled(AiInteractionStatus.ERROR),
        assistant(answerText, AiInteractionStatus.ERROR),
      ];

    // The turn did not happen, and neither half of it stands.
    case AiRequestExecutionStatus.USER_INPUT_TOO_LARGE:
      return [
        settled(AiInteractionStatus.USER_INPUT_TOO_LARGE),
        assistant(answerText, AiInteractionStatus.USER_INPUT_TOO_LARGE),
      ];
    case AiRequestExecutionStatus.MODEL_TIMEOUT:
      return [
        settled(AiInteractionStatus.MODEL_TIMEOUT),
        assistant(answerText, AiInteractionStatus.MODEL_TIMEOUT),
      ];
    case AiRequestExecutionStatus.MODEL_RATE_LIMITED:
      return [
        settled(AiInteractionStatus.MODEL_RATE_LIMITED),
        assistant(answerText, AiInteractionStatus.MODEL_RATE_LIMITED),
      ];

    default:
      // Including the statuses this mapping predates — MODEL_IMAGE_FLAGGED and
      // MODEL_CONTENT_FILTERED, which the legacy switch also has no arm for and
      // throws on. Throwing loses the turn AND the student's question; a
      // generic failure at least keeps the transcript honest about what
      // happened.
      return [
        settled(AiInteractionStatus.ERROR),
        assistant(answerText, AiInteractionStatus.ERROR),
      ];
  }
};
