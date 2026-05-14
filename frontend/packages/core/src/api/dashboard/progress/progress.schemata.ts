import camelcaseKeys from 'camelcase-keys';
import {z} from 'zod';

import {LevelStatuses, ReviewStates, TestResults} from './progress.constants';
import type {TestResult} from './progress.constants';

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
 * Wire-format (snake_case) shape of a single level's progress as returned
 * by the dashboard progress API. Use `UnitProgressSchema` below for the
 * consumer-facing camelCase shape — this schema is mostly here as the
 * input layer that the `.transform(...)` chain operates on.
 *
 * `status` is validated against the canonical `LevelStatuses` list;
 * `result` / `pages_completed[]` entries against `TestResults`. Both
 * lists live alongside this schema in `progress.constants.ts` and the
 * dashboard counterparts (`activity_constants.rb`,
 * `LevelGroupConstants::LEVEL_STATUS`) must stay in sync — they back
 * persisted columns.
 */
export const UnitProgressDefinitionSchema = z.object({
  status: z.enum(LevelStatuses),
  last_progress_at: z.number().optional(),
  locked: z.boolean().optional(),
  pages_completed: z.array(TestResultSchema).optional(),
  paired: z.boolean().optional(),
  result: TestResultSchema.optional(),
  teacher_feedback_commented: z.boolean().optional(),
  teacher_feedback_review_state: z.enum(ReviewStates).optional(),
  teacher_feedback_new: z.boolean().optional(),
  time_spent: z.number().optional(),
});

/**
 * Consumer-facing camelCase shape — `last_progress_at` → `lastProgressAt`,
 * `teacher_feedback_*` → `teacherFeedback*`, etc.
 */
export const UnitProgressSchema = UnitProgressDefinitionSchema.transform(data =>
  camelcaseKeys(data, {deep: true}),
);

/**
 * Optional fields the client may attach to a milestone report. `program`
 * carries the user's code for predict-level reports; `submitted` is a
 * stringified boolean ("true"/"false") for submit/unsubmit toggles.
 *
 * Request-side schema — the milestone endpoint accepts camelCase request
 * bodies, so no transform is needed here.
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
 * Wire-format shape of the `/api/user_progress/:scriptName` response.
 * Top-level keys are mostly already camelCase from the server, but
 * `current_lesson` and the snake_case fields inside each `progress`
 * entry need conversion. Use `UserProgressResponseSchema` below for the
 * consumer-facing shape.
 *
 * Every field is optional because the server omits keys it doesn't have
 * information for (new users, deeperLearningCourse paths, etc).
 */
export const UserProgressResponseDefinitionSchema = z.object({
  isInstructor: z.boolean().optional(),
  teacherViewingStudent: z.boolean().optional(),
  deeperLearningCourse: z.boolean().optional(),
  focusAreaLessonIds: z.array(z.number()).optional(),
  changeFocusAreaPath: z.string().optional(),
  completed: z.boolean().optional(),
  progress: z.record(z.string(), UnitProgressDefinitionSchema).optional(),
  // Server-side: `PeerReview#summarize` in dashboard. `status` is
  // either `LEVEL_STATUS.perfect` or `LEVEL_STATUS.not_tried`; `result`
  // is either `ActivityConstants::UNSUBMITTED_RESULT` (-50) or
  // `ActivityConstants::BEST_PASS_RESULT` (100). Validating against the
  // full enums rather than the two values that actually flow today
  // because (a) it's the canonical wire shape and (b) it'd be brittle
  // to pin the subset.
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
  current_lesson: z.number().optional(),
});

/**
 * Consumer-facing camelCase shape. Each `progress` entry is recursively
 * converted by the `deep: true` flag — `time_spent` → `timeSpent`, etc.
 * The top-level `current_lesson` field also becomes `currentLesson`.
 */
export const UserProgressResponseSchema =
  UserProgressResponseDefinitionSchema.transform(data =>
    camelcaseKeys(data, {deep: true}),
  );
