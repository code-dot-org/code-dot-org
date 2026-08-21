// One number from the server, fourteen different things on screen.
//
// Every arm of this is something a student sees, and the asymmetries between
// them are the legacy's and deliberate — which makes them exactly the kind of
// thing a rewrite flattens by accident.

import {describe, expect, it} from 'vitest';

import {AiRequestExecutionStatus} from '@code-dot-org/core/api';

import {Role, type PendingMessage} from '../../../model/messages';
import {AiInteractionStatus} from '../../../model/status';
import {messagesFor, stillRunning} from '../executionStatus';

const question: PendingMessage = {
  role: Role.USER,
  status: AiInteractionStatus.UNKNOWN,
  chatMessageText: 'why?',
  timestamp: 0,
  updateId: 'a',
};

const forStatus = (status: number, text = 'because') =>
  messagesFor(question, text, status);

describe('stillRunning', () => {
  it('is true for everything below success', () => {
    // The one place the ordering of the constants is relied on.
    expect(stillRunning(AiRequestExecutionStatus.NOT_STARTED)).toBe(true);
    expect(stillRunning(AiRequestExecutionStatus.QUEUED)).toBe(true);
    expect(stillRunning(AiRequestExecutionStatus.RUNNING)).toBe(true);
  });

  it('is false for success and for every failure', () => {
    expect(stillRunning(AiRequestExecutionStatus.SUCCESS)).toBe(false);
    expect(stillRunning(AiRequestExecutionStatus.FAILURE)).toBe(false);
    expect(stillRunning(AiRequestExecutionStatus.MODEL_RATE_LIMITED)).toBe(
      false,
    );
  });
});

describe('messagesFor', () => {
  it('answers a successful turn with the question and the answer', () => {
    const [asked, answered] = forStatus(AiRequestExecutionStatus.SUCCESS);

    expect(asked).toMatchObject({
      role: Role.USER,
      chatMessageText: 'why?',
      status: AiInteractionStatus.OK,
      updateId: 'a',
    });
    expect(answered).toMatchObject({
      role: Role.ASSISTANT,
      chatMessageText: 'because',
      status: AiInteractionStatus.OK,
    });
  });

  it('gives a rejected QUESTION one message, because nothing was asked', () => {
    // The model was never called, so there is nothing for it to have said.
    expect(forStatus(AiRequestExecutionStatus.USER_PROFANITY)).toEqual([
      expect.objectContaining({
        status: AiInteractionStatus.PROFANITY_VIOLATION,
      }),
    ]);
    expect(forStatus(AiRequestExecutionStatus.USER_PII)).toEqual([
      expect.objectContaining({status: AiInteractionStatus.PII_VIOLATION}),
    ]);
  });

  it('gives a rejected ANSWER two, and does not blame the question', () => {
    // The student's question was fine; it was the answer that was not. So the
    // question is marked ERROR — it produced nothing — and the reason goes on
    // the answer.
    const [asked, answered] = forStatus(
      AiRequestExecutionStatus.MODEL_PROFANITY,
    );

    expect(asked.status).toBe(AiInteractionStatus.ERROR);
    expect(answered.status).toBe(AiInteractionStatus.PROFANITY_VIOLATION);
  });

  it('marks both halves when the turn did not happen at all', () => {
    for (const [status, expected] of [
      [
        AiRequestExecutionStatus.MODEL_TIMEOUT,
        AiInteractionStatus.MODEL_TIMEOUT,
      ],
      [
        AiRequestExecutionStatus.MODEL_RATE_LIMITED,
        AiInteractionStatus.MODEL_RATE_LIMITED,
      ],
      [
        AiRequestExecutionStatus.USER_INPUT_TOO_LARGE,
        AiInteractionStatus.USER_INPUT_TOO_LARGE,
      ],
    ] as const) {
      expect(forStatus(status).map(m => m.status)).toEqual([
        expected,
        expected,
      ]);
    }
  });

  it('fails generically rather than throwing on a status it does not know', () => {
    // MODEL_IMAGE_FLAGGED and MODEL_CONTENT_FILTERED have no arm in the legacy
    // switch either, and it throws — losing the turn AND the student's
    // question. A generic failure at least keeps the transcript honest.
    expect(() =>
      forStatus(AiRequestExecutionStatus.MODEL_CONTENT_FILTERED),
    ).not.toThrow();
    expect(
      forStatus(AiRequestExecutionStatus.MODEL_IMAGE_FLAGGED).map(
        m => m.status,
      ),
    ).toEqual([AiInteractionStatus.ERROR, AiInteractionStatus.ERROR]);
  });
});
