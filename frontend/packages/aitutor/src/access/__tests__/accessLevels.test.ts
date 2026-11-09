// Whether the tutor may be here at all.
//
// The rule that decides whether an AI tool appears in a classroom. Every test
// here is a case a teacher can create from the AI Settings page, and the
// consequence of getting one wrong is a tool running where somebody said it
// should not.

import {describe, expect, it} from 'vitest';

import {
  AiChatAccessLevels,
  areAiChatToolsEnabled,
  shouldShowAiTutor,
} from '../accessLevels';

describe('areAiChatToolsEnabled', () => {
  it('needs an explicit yes for an app where chat is not essential', () => {
    for (const appName of ['pythonlab', 'world']) {
      expect(
        areAiChatToolsEnabled({
          appName,
          aiChatAccessLevel: AiChatAccessLevels.ENABLED,
        }),
      ).toBe(true);
      expect(
        areAiChatToolsEnabled({
          appName,
          aiChatAccessLevel: AiChatAccessLevels.ESSENTIAL_ONLY,
        }),
      ).toBe(false);
    }
  });

  it('takes essential-only as a yes where chat IS essential', () => {
    // Which is the whole point of that setting: keep the tool where the course
    // does not work without it, and nowhere else.
    expect(
      areAiChatToolsEnabled({
        appName: 'weblab2',
        aiChatAccessLevel: AiChatAccessLevels.ESSENTIAL_ONLY,
      }),
    ).toBe(true);
    expect(
      areAiChatToolsEnabled({
        appName: 'aichat',
        aiChatAccessLevel: AiChatAccessLevels.ESSENTIAL_ONLY,
      }),
    ).toBe(true);
  });

  it('takes disabled as a no everywhere, essential or not', () => {
    for (const appName of ['weblab2', 'aichat', 'pythonlab']) {
      expect(
        areAiChatToolsEnabled({
          appName,
          aiChatAccessLevel: AiChatAccessLevels.DISABLED,
        }),
      ).toBe(false);
    }
  });

  it('takes silence as a no', () => {
    // A payload that did not carry the field is not permission. The other way
    // round, an AI tool appears wherever the server forgot to say.
    expect(
      areAiChatToolsEnabled({appName: 'weblab2', aiChatAccessLevel: undefined}),
    ).toBe(false);
  });
});

describe('shouldShowAiTutor', () => {
  it('shows it where the app does not work without it, whatever the level says', () => {
    expect(
      shouldShowAiTutor({
        appName: 'weblab2',
        isTutorLevel: false,
        aiChatAccessLevel: AiChatAccessLevels.DISABLED,
      }),
    ).toBe(true);
  });

  it('shows it on a tutor level when access allows', () => {
    expect(
      shouldShowAiTutor({
        appName: 'pythonlab',
        isTutorLevel: true,
        aiChatAccessLevel: AiChatAccessLevels.ENABLED,
      }),
    ).toBe(true);
  });

  it('hides it on a tutor level when a teacher switched it off', () => {
    // Hidden rather than shown-and-disabled: a control that has never worked
    // is not one anybody misses, and showing one would change what mid-year
    // classrooms see.
    expect(
      shouldShowAiTutor({
        appName: 'pythonlab',
        isTutorLevel: true,
        aiChatAccessLevel: AiChatAccessLevels.DISABLED,
      }),
    ).toBe(false);
  });

  it('hides it on a level that never offered one', () => {
    expect(
      shouldShowAiTutor({
        appName: 'pythonlab',
        isTutorLevel: false,
        aiChatAccessLevel: AiChatAccessLevels.ENABLED,
      }),
    ).toBe(false);
    expect(
      shouldShowAiTutor({
        appName: 'pythonlab',
        aiChatAccessLevel: AiChatAccessLevels.ENABLED,
      }),
    ).toBe(false);
  });
});
