// Whether the tutor is here but cannot be used, and what to say about it.
//
// Distinct from `shouldShowAiTutor`, which decides whether it is here at all.
// The two answer different questions and the legacy keeps them apart for a
// reason: a tutor that is absent is a course that does not offer one, and a
// tutor that is present but disabled is a thing the student can see and ask
// their teacher about.
//
// Ported from `useAiChatDisabledState`, minus the hook. It read four values out
// of studio redux; here they are arguments, because none of them live in this
// package's state (`access/accessLevels` explains the bargain).

import {areAiChatToolsEnabled, type AiChatAccessLevel} from './accessLevels';

export const AI_SETTINGS_SUPPORT_LINK =
  'https://support.code.org/hc/en-us/articles/42550900593677-AI-Settings';

export const VERIFIED_TEACHER_SUPPORT_LINK =
  'https://support.code.org/hc/en-us/articles/115001550131-How-to-Become-a-Verified-Teacher';

export const AI_CHAT_NOT_AUTHORIZED_TEACHER =
  'You must be a verified teacher or sign in via Google, Microsoft, Facebook, or an LMS to use and assign this tool.';

export const AI_CHAT_NOT_AUTHORIZED_STUDENT =
  'Your teacher has not enabled this tool. Check with your teacher if you think this is an error.';

export interface DisabledLink {
  href: string;
  text: string;
  openInNewTab?: boolean;
}

export interface AiChatDisabledState {
  disabled: boolean;
  disabledMessage?: string;
  disabledLink?: DisabledLink;
}

export interface AccessFacts {
  /** The lab's app name, which decides whether chat is essential here. */
  appName?: string;
  /** The signed-in user's own access level. */
  userAccessLevel: AiChatAccessLevel | undefined;
  /** The selected section's, when a teacher is looking at one. */
  sectionAccessLevel?: AiChatAccessLevel;
  isTeacher?: boolean;
  isLevelbuilder?: boolean;
  /** Predict levels hold the tutor back until the student has answered. */
  isPredictLevel?: boolean;
  hasSubmittedPredictResponse?: boolean;
  /** Levelbuilder's start mode, where the predict gate does not apply. */
  isStartMode?: boolean;
}

/**
 * Whether chat is usable, and what to tell whoever cannot use it.
 *
 * The order of the tests is the legacy's and each step is load-bearing:
 *
 *   1. No app name means nothing is known, so nothing is allowed.
 *   2. A LEVELBUILDER is always allowed, so that building a tutor level does
 *      not require setting up an account to see the thing being built.
 *   3. A PREDICT LEVEL holds it back until the student has answered, because a
 *      tutor would answer the question they are being asked to predict.
 *   4. A TEACHER who has access but whose selected section does not is told
 *      about the SECTION — this is what a teacher checking on a class needs to
 *      know, and it is roughly what their students are seeing.
 *   5. A teacher without access is told how to get verified.
 *   6. A student without access is told to ask their teacher.
 */
export const disabledStateFor = (facts: AccessFacts): AiChatDisabledState => {
  const {
    appName,
    userAccessLevel,
    sectionAccessLevel,
    isTeacher,
    isLevelbuilder,
    isPredictLevel = false,
    hasSubmittedPredictResponse = false,
    isStartMode = false,
  } = facts;

  if (!appName) {
    return {disabled: true};
  }

  if (isLevelbuilder) {
    return {disabled: false};
  }

  if (isPredictLevel && !hasSubmittedPredictResponse && !isStartMode) {
    return {
      disabled: true,
      disabledMessage: 'Chat is disabled until you submit your prediction.',
    };
  }

  const enabledForUser = areAiChatToolsEnabled({
    appName,
    aiChatAccessLevel: userAccessLevel,
  });

  if (isTeacher) {
    if (
      enabledForUser &&
      sectionAccessLevel &&
      !areAiChatToolsEnabled({appName, aiChatAccessLevel: sectionAccessLevel})
    ) {
      // Not exactly what the student sees — a student may have access through
      // another teacher's section — but it is what this teacher's class has.
      return {
        disabled: true,
        disabledMessage: 'Chat is disabled for this class section.',
        disabledLink: {
          href: AI_SETTINGS_SUPPORT_LINK,
          openInNewTab: true,
          text: 'Learn more',
        },
      };
    }
    if (!enabledForUser) {
      return {
        disabled: true,
        disabledMessage: AI_CHAT_NOT_AUTHORIZED_TEACHER,
        disabledLink: {
          href: VERIFIED_TEACHER_SUPPORT_LINK,
          openInNewTab: true,
          text: 'Learn how to become a verified teacher',
        },
      };
    }
    return {disabled: false};
  }

  return enabledForUser
    ? {disabled: false}
    : {disabled: true, disabledMessage: AI_CHAT_NOT_AUTHORIZED_STUDENT};
};
