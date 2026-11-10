// Whether the tutor may be here at all.
//
// Ported from `apps/src/aichat/helpers/aiChatAccess.ts` and
// `hooks/useAiChatDisabledState.ts`. These are the rules that decide whether a
// student sees a tutor, and they are the reason `ResourcePanel` shows no tab
// until a host asks for one: getting this wrong puts an AI tool in a classroom
// where a teacher switched it off.
//
// PURE FUNCTIONS, taking the facts rather than reading them. The legacy hook
// reads four things out of studio redux — the user's own access level, the
// selected section's, whether they are a teacher, whether they are a
// levelbuilder — and none of those live in this package's state. The host has
// them and passes them, which is the same bargain as `TutorRequest.session`
// and `TutorConfig.context`.
//
// WHY THE HOST MUST STILL CALL THESE: the panel cannot apply a rule about state
// it cannot see. What this file buys is that there is ONE copy of the rule, and
// a lab that forgets to call it is a lab that failed to ask rather than a lab
// that asked and got the wrong answer.

/** Mirrors `SharedConstants::AI_CHAT_ACCESS_LEVELS`. */
export const AiChatAccessLevels = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  /** Permitted only where AI chat is essential to the app (see below). */
  ESSENTIAL_ONLY: 'essential_only',
} as const;

export type AiChatAccessLevel =
  (typeof AiChatAccessLevels)[keyof typeof AiChatAccessLevels];

/**
 * Apps whose experience does not work without the tutor.
 *
 * A teacher can still switch it off entirely — `DISABLED` disables it
 * everywhere — but `ESSENTIAL_ONLY` keeps it for these and nothing else.
 */
export const APPS_WHERE_AI_TUTOR_IS_ESSENTIAL: readonly string[] = ['weblab2'];

/** The above, plus the chat lab, whose whole subject is the chat. */
export const APPS_WITH_ESSENTIAL_AI_CHAT: readonly string[] = [
  ...APPS_WHERE_AI_TUTOR_IS_ESSENTIAL,
  'aichat',
];

/**
 * Whether an access level permits AI chat tools in a given app.
 *
 * For an app where chat is essential, anything but `DISABLED` allows it. For
 * every other app it takes an explicit `ENABLED` — `ESSENTIAL_ONLY` means what
 * it says.
 */
export const areAiChatToolsEnabled = ({
  appName,
  aiChatAccessLevel,
}: {
  appName: string;
  aiChatAccessLevel: AiChatAccessLevel | undefined;
}): boolean => {
  if (aiChatAccessLevel === undefined) {
    // Nothing said. Treated as no, because the alternative is an AI tool
    // appearing wherever a payload happened not to carry the field.
    return false;
  }
  if (APPS_WITH_ESSENTIAL_AI_CHAT.includes(appName)) {
    return aiChatAccessLevel !== AiChatAccessLevels.DISABLED;
  }
  return aiChatAccessLevel === AiChatAccessLevels.ENABLED;
};

/**
 * Whether the tutor tab should exist.
 *
 * HIDDEN RATHER THAN DISABLED when the answer is no, which is the legacy's
 * choice and its reasoning is worth keeping: showing a disabled tutor would
 * change what mid-year classrooms see on courses where the tutor is optional,
 * and a control that has never worked is not a control anybody misses.
 */
export const shouldShowAiTutor = ({
  appName,
  isTutorLevel,
  aiChatAccessLevel,
}: {
  appName: string;
  /** Whether this level offers a tutor at all (`level.aiTutorAvailable`). */
  isTutorLevel?: boolean;
  aiChatAccessLevel: AiChatAccessLevel | undefined;
}): boolean =>
  APPS_WHERE_AI_TUTOR_IS_ESSENTIAL.includes(appName) ||
  Boolean(isTutorLevel && areAiChatToolsEnabled({appName, aiChatAccessLevel}));
