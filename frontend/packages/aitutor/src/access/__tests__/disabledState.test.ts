// Whether the tutor is here but unusable, and what it says about that.
//
// The order of the tests inside `disabledStateFor` is load-bearing, so most of
// these are about precedence: which rule wins when two apply.

import {describe, expect, it} from 'vitest';

import {AiChatAccessLevels} from '../accessLevels';
import {
  AI_CHAT_NOT_AUTHORIZED_STUDENT,
  AI_CHAT_NOT_AUTHORIZED_TEACHER,
  disabledStateFor,
} from '../disabledState';

const student = {
  appName: 'pythonlab',
  userAccessLevel: AiChatAccessLevels.ENABLED,
};

describe('disabledStateFor', () => {
  it('disables everything when it does not know what app this is', () => {
    // Nothing known, nothing allowed.
    expect(
      disabledStateFor({appName: undefined, userAccessLevel: undefined}),
    ).toEqual({disabled: true});
  });

  it('always allows a levelbuilder, even one with no access of their own', () => {
    // Or building a tutor level would mean setting up an account to see the
    // thing being built.
    expect(
      disabledStateFor({
        ...student,
        userAccessLevel: AiChatAccessLevels.DISABLED,
        isLevelbuilder: true,
      }),
    ).toEqual({disabled: false});
  });

  it('holds it back on a predict level until the student has answered', () => {
    // A tutor would answer the question they are being asked to predict.
    expect(disabledStateFor({...student, isPredictLevel: true})).toMatchObject({
      disabled: true,
      disabledMessage: 'Chat is disabled until you submit your prediction.',
    });

    expect(
      disabledStateFor({
        ...student,
        isPredictLevel: true,
        hasSubmittedPredictResponse: true,
      }),
    ).toEqual({disabled: false});
  });

  it('does not hold it back in start mode, where there is no prediction', () => {
    expect(
      disabledStateFor({...student, isPredictLevel: true, isStartMode: true}),
    ).toEqual({disabled: false});
  });

  it('tells a teacher about the SECTION when the section is what blocks it', () => {
    // What a teacher checking on a class needs to know, and roughly what their
    // students are seeing.
    expect(
      disabledStateFor({
        ...student,
        isTeacher: true,
        sectionAccessLevel: AiChatAccessLevels.DISABLED,
      }),
    ).toMatchObject({
      disabled: true,
      disabledMessage: 'Chat is disabled for this class section.',
      disabledLink: {text: 'Learn more'},
    });
  });

  it('tells an unverified teacher how to get verified', () => {
    expect(
      disabledStateFor({
        ...student,
        userAccessLevel: AiChatAccessLevels.DISABLED,
        isTeacher: true,
      }),
    ).toMatchObject({
      disabled: true,
      disabledMessage: AI_CHAT_NOT_AUTHORIZED_TEACHER,
      disabledLink: {text: 'Learn how to become a verified teacher'},
    });
  });

  it('prefers the verification message over the section one', () => {
    // A teacher with no access of their own cannot use it whatever the section
    // says, and telling them to check the section would send them somewhere
    // that would not help.
    expect(
      disabledStateFor({
        ...student,
        userAccessLevel: AiChatAccessLevels.DISABLED,
        isTeacher: true,
        sectionAccessLevel: AiChatAccessLevels.DISABLED,
      }).disabledMessage,
    ).toBe(AI_CHAT_NOT_AUTHORIZED_TEACHER);
  });

  it('tells a student to ask their teacher', () => {
    expect(
      disabledStateFor({
        ...student,
        userAccessLevel: AiChatAccessLevels.DISABLED,
      }),
    ).toEqual({
      disabled: true,
      disabledMessage: AI_CHAT_NOT_AUTHORIZED_STUDENT,
    });
  });

  it('never shows a student the section message', () => {
    // A student may have access through another teacher's section, and the
    // selected-section notion is a teacher's anyway.
    expect(
      disabledStateFor({
        ...student,
        sectionAccessLevel: AiChatAccessLevels.DISABLED,
      }),
    ).toEqual({disabled: false});
  });

  it('lets a levelbuilder past the predict gate too', () => {
    // Precedence: levelbuilder is tested before the prediction.
    expect(
      disabledStateFor({
        ...student,
        isLevelbuilder: true,
        isPredictLevel: true,
      }),
    ).toEqual({disabled: false});
  });
});
