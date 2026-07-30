// Vendored snapshot of the five constants the feature reads from
// @cdo/generated-scripts/sharedConstants. The generated file is gitignored
// (dashboard emits it from lib/cdo/shared_constants.rb during the apps
// build), so a fresh checkout has no copy; vendoring keeps the dev host,
// Vitest, and typecheck working without a Rails build.

export const AiInteractionStatus = {
  ERROR: 'error',
  PII_VIOLATION: 'pii_violation',
  PROFANITY_VIOLATION: 'profanity_violation',
  USER_INPUT_TOO_LARGE: 'user_input_too_large',
  MODEL_TIMEOUT: 'model_timeout',
  MODEL_RATE_LIMITED: 'model_rate_limited',
  OK: 'ok',
  UNKNOWN: 'unknown',
} as const;

export const AiChatClientTypes = {
  AI_CHAT_LAB: 'ai-chat-lab',
  AI_TUTOR: 'ai-tutor',
  FLOW_LAB: 'flow-lab',
  LESSON_DEEP_DIVE: 'lesson-deep-dive',
} as const;

export const LessonObjectiveReflectionValues = {
  UNSURE: 'unsure',
  LOST: 'lost',
  CONFIDENT: 'confident',
} as const;

export const PracticeProblemTypes = {
  MULTIPLE_CHOICE_MULTI: 'multiple_choice_multi_select',
  MULTIPLE_CHOICE_SINGLE: 'multiple_choice_single_select',
  MATCH: 'match',
  SORT: 'sort',
  SCRAMBLE: 'scramble',
} as const;

export const PracticeProblemDeliveryContext = {
  AI_TUTOR_LESSON_DEEP_DIVE: 'ai_tutor_lesson_deep_dive',
} as const;
