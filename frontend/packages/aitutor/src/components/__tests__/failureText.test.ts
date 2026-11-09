// What the panel says instead of a message that did not survive.
//
// The mapping is the point of having a status vocabulary at all, and getting it
// wrong shows a student the wrong explanation for their own failure.

import {describe, expect, it} from 'vitest';

import {Role} from '../../model/messages';
import {AiInteractionStatus} from '../../model/status';
import {strings} from '../../strings';
import {failureText} from '../failureText';

describe('failureText', () => {
  it('leaves an ordinary turn to show its own words', () => {
    expect(failureText(Role.USER, AiInteractionStatus.OK)).toBeUndefined();
    expect(failureText(Role.ASSISTANT, AiInteractionStatus.OK)).toBeUndefined();
  });

  it('replaces a rejected question rather than annotating it', () => {
    // The student's own words are the thing that was flagged; repeating them
    // under a notice about them is the one presentation nobody wants.
    expect(
      failureText(Role.USER, AiInteractionStatus.PROFANITY_VIOLATION),
    ).toBe(strings.inappropriateUser);
    expect(failureText(Role.USER, AiInteractionStatus.PII_VIOLATION)).toBe(
      strings.tooPersonal,
    );
  });

  it('says something different to each side about the same status', () => {
    // A flagged question and a flagged answer are different events, and the
    // legacy copy distinguishes them.
    expect(
      failureText(Role.ASSISTANT, AiInteractionStatus.PROFANITY_VIOLATION),
    ).toBe(strings.inappropriateModel);
  });

  it('has copy for every way an answer can fail', () => {
    const answerFailures = [
      AiInteractionStatus.USER_INPUT_TOO_LARGE,
      AiInteractionStatus.MODEL_TIMEOUT,
      AiInteractionStatus.MODEL_RATE_LIMITED,
      AiInteractionStatus.ERROR,
    ];

    for (const status of answerFailures) {
      expect(failureText(Role.ASSISTANT, status)).toBeTruthy();
    }
  });

  it('does not explain an answer failure on the student’s own message', () => {
    // A timeout is not something the student did.
    expect(
      failureText(Role.USER, AiInteractionStatus.MODEL_TIMEOUT),
    ).toBeUndefined();
  });
});
