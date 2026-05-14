import camelcaseKeys from 'camelcase-keys';
import {z} from 'zod';

import {LevelStatuses, ReviewStates, TestResults} from './progress.constants';
import type {TestResult} from './progress.constants';

/**
 * Convert snake_case keys to camelCase before validation. The dashboard
 * progress API mixes both casings on the wire (e.g. `time_spent` next
 * to already-camelCase `peerReviewsPerformed`), so we preprocess
 * everything to the consumer's camelCase shape and then validate.
 * Idempotent on already-camelCase input.
 */
function camelcasePreprocess(data: unknown): unknown {
  return typeof data === 'object' && data !== null && !Array.isArray(data)
    ? camelcaseKeys(data as Record<string, unknown>, {deep: true})
    : data;
}

/**
 * z.enum-style schema for `TestResult` codes. zod's `z.enum` is
 * string-only, so we build a union of `z.literal(...)` for each numeric
 * value.
 *
 * The static type is asserted as `z.ZodType<TestResult>` so consumers'
 * inferred result type stays the literal union — the inner cast widens
 * each member to `z.ZodLiteral<number>`, and without this outer
 * assertion `z.infer<typeof TestResultSchema>` resolves to `number`.
 */
const TestResultSchema = z.union(
  Object.values(TestResults).map(v => z.literal(v)) as [
    z.ZodLiteral<number>,
    z.ZodLiteral<number>,
    ...z.ZodLiteral<number>[],
  ],
) as unknown as z.ZodType<TestResult>;

/**
 * A single level's progress as returned by the dashboard progress API,
 * normalized to the consumer camelCase shape.
 *
 * The wire format is snake_case (`time_spent`, `last_progress_at`, …);
 * `camelcasePreprocess` converts it on the way in so the schema
 * declarations and `z.infer<>` output match what callers use.
 *
 * `status` is validated against the canonical `LevelStatuses` list;
 * `result` / `pagesCompleted[]` entries against `TestResults`. Both
 * lists live alongside this schema in `progress.constants.ts` and the
 * dashboard counterparts (`activity_constants.rb`,
 * `LevelGroupConstants::LEVEL_STATUS`) must stay in sync — they back
 * persisted columns.
 */
export const UnitProgressSchema = z.preprocess(
  camelcasePreprocess,
  z.object({
    status: z.enum(LevelStatuses),
    lastProgressAt: z.number().optional(),
    locked: z.boolean().optional(),
    pagesCompleted: z.array(TestResultSchema).optional(),
    paired: z.boolean().optional(),
    result: TestResultSchema.optional(),
    teacherFeedbackCommented: z.boolean().optional(),
    teacherFeedbackReviewState: z.enum(ReviewStates).optional(),
    teacherFeedbackNew: z.boolean().optional(),
    timeSpent: z.number().optional(),
  }),
);

/**
 * Optional fields the client may attach to a milestone report. `program`
 * carries the user's code for predict-level reports; `submitted` is a
 * stringified boolean ("true"/"false") for submit/unsubmit toggles.
 *
 * Request-side schema — the milestone endpoint accepts camelCase request
 * bodies, so no preprocess is needed here.
 */
export const OptionalMilestoneDataSchema = z.object({
  program: z.string().optional(),
  submitted: z.string().optional(),
});

/**
 * Body POSTed to `/milestone/:userId/:scriptLevelId/:levelId`.
 *
 * `result: true` is always true in current call sites — historically it
 * signaled "we have a real result to report" as opposed to a ping. Kept
 * as `z.literal(true)` to surface any future caller that tries to pass
 * `false`.
 */
export const MilestoneReportSchema = OptionalMilestoneDataSchema.extend({
  app: z.string(),
  result: z.literal(true),
  testResult: z.number(),
});

/**
 * Response from `/api/user_progress/:scriptName`, normalized to the
 * consumer camelCase shape. The wire mixes casings — most top-level
 * keys are already camelCase but `current_lesson` is snake_case, and
 * `progress` entries are fully snake_case — so we preprocess
 * recursively before validation.
 *
 * Every field is optional because the server omits keys it doesn't
 * have information for (new users, deeperLearningCourse paths, etc).
 */
export const UserProgressResponseSchema = z.preprocess(
  camelcasePreprocess,
  z.object({
    isInstructor: z.boolean().optional(),
    teacherViewingStudent: z.boolean().optional(),
    deeperLearningCourse: z.boolean().optional(),
    focusAreaLessonIds: z.array(z.number()).optional(),
    changeFocusAreaPath: z.string().optional(),
    completed: z.boolean().optional(),
    // `progress` entries are validated camelCase too — the outer
    // preprocess sweeps deep, so `time_spent` → `timeSpent` before the
    // inner schema sees it.
    progress: z
      .record(
        z.string(),
        z.object({
          status: z.enum(LevelStatuses),
          lastProgressAt: z.number().optional(),
          locked: z.boolean().optional(),
          pagesCompleted: z.array(TestResultSchema).optional(),
          paired: z.boolean().optional(),
          result: TestResultSchema.optional(),
          teacherFeedbackCommented: z.boolean().optional(),
          teacherFeedbackReviewState: z.enum(ReviewStates).optional(),
          teacherFeedbackNew: z.boolean().optional(),
          timeSpent: z.number().optional(),
        }),
      )
      .optional(),
    // Server-side: `PeerReview#summarize` in dashboard. `status` is
    // either `LEVEL_STATUS.perfect` or `LEVEL_STATUS.not_tried`;
    // `result` is either `ActivityConstants::UNSUBMITTED_RESULT` (-50)
    // or `ActivityConstants::BEST_PASS_RESULT` (100). Validating
    // against the full enums rather than just the two values that flow
    // today because (a) that's the canonical wire shape and (b) it'd
    // be brittle to pin the subset.
    peerReviewsPerformed: z
      .array(
        z.object({
          status: z.enum(LevelStatuses),
          name: z.string(),
          result: TestResultSchema,
          icon: z.string(),
          locked: z.boolean(),
        }),
      )
      .optional(),
    currentLesson: z.number().optional(),
  }),
);
