// How a chat turn ended.
//
// Copied from `SharedConstants::AI_INTERACTION_STATUS` (lib/cdo/shared_constants.rb),
// which studio generates into `apps/generated-scripts/sharedConstants.ts`. A
// package cannot import a generated studio artifact — the generator runs in the
// Rails tree and the output is not published — so the values live here, with the
// same names, so that a divergence is a diff rather than a discovery.
//
// The names are load-bearing beyond bookkeeping: everything the panel says about
// a failed turn is chosen from this one field. There is no separate error
// object, and a transport that cannot say WHY it failed can only say `ERROR`,
// which is the copy of last resort.

export const AiInteractionStatus = {
  /** The turn completed and there is an answer. */
  OK: 'ok',
  /** Sent, not yet answered. The only status a pending message may hold. */
  UNKNOWN: 'unknown',
  /** Anything the other members do not name. */
  ERROR: 'error',
  PII_VIOLATION: 'pii_violation',
  PROFANITY_VIOLATION: 'profanity_violation',
  USER_INPUT_TOO_LARGE: 'user_input_too_large',
  MODEL_TIMEOUT: 'model_timeout',
  MODEL_RATE_LIMITED: 'model_rate_limited',
} as const;

export type AiInteractionStatus =
  (typeof AiInteractionStatus)[keyof typeof AiInteractionStatus];

/**
 * A status a COMPLETED turn may hold.
 *
 * `UNKNOWN` is reserved for a message still in flight, which is what makes the
 * pending and completed types discriminable at all.
 */
export type CompletedStatus = Exclude<
  AiInteractionStatus,
  typeof AiInteractionStatus.UNKNOWN
>;

/**
 * Whether a status marks the message as one the student's own text failed.
 *
 * Two of the failures are about what was TYPED rather than what was answered,
 * and they land on the user's own message: the model is never called, so there
 * is no assistant turn to carry them (`generateChatResponse` returns before it
 * builds one). Everything else is a failure of the answer.
 */
export const isUserTurnFailure = (status: AiInteractionStatus): boolean =>
  status === AiInteractionStatus.PROFANITY_VIOLATION ||
  status === AiInteractionStatus.PII_VIOLATION ||
  status === AiInteractionStatus.USER_INPUT_TOO_LARGE;
