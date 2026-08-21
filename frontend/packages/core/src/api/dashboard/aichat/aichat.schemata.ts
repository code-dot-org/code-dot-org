import {z} from 'zod';

/**
 * How far a chat completion request has got.
 *
 * Mirrors `SharedConstants::AI_REQUEST_EXECUTION_STATUS`
 * (lib/cdo/shared_constants.rb), which studio generates into
 * `apps/generated-scripts/sharedConstants.ts`. A frontend package cannot import
 * that generated artifact — the generator runs in the Rails tree and its output
 * is not published — so the values live here, with the same names, so a
 * divergence is a diff rather than a discovery.
 *
 * THE NUMBERS ARE ORDERED and the ordering is load-bearing: anything below
 * `SUCCESS` means "still working", which is what the polling loop tests. The
 * gap to 1000 is where the failures start.
 */
export const AiRequestExecutionStatus = {
  NOT_STARTED: 0,
  QUEUED: 1,
  RUNNING: 2,
  SUCCESS: 3,
  FAILURE: 1000,
  USER_PROFANITY: 1001,
  USER_PII: 1002,
  MODEL_PROFANITY: 1003,
  MODEL_PII: 1004,
  USER_INPUT_TOO_LARGE: 1005,
  MODEL_TIMEOUT: 1006,
  MODEL_IMAGE_FLAGGED: 1007,
  MODEL_RATE_LIMITED: 1008,
  MODEL_CONTENT_FILTERED: 1009,
} as const;

export type AiRequestExecutionStatus =
  (typeof AiRequestExecutionStatus)[keyof typeof AiRequestExecutionStatus];

/** What starting a completion answers: an id, and how often to ask about it. */
export const StartChatCompletionSchema = z.object({
  requestId: z.number(),
  /** How long to wait before the first poll. */
  pollingIntervalMs: z.number(),
  /** What to multiply the interval by after each poll. May be absent. */
  backoffRate: z.number().optional(),
});

/** What one poll answers. `response` is empty until the request finishes. */
export const ChatRequestSchema = z.object({
  executionStatus: z.number(),
  response: z.string(),
});
