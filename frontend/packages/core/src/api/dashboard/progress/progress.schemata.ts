import {z} from 'zod';

/**
 * Wire format for a single level's progress as returned by the dashboard
 * progress API. Snake_case mirrors the Rails JSON exactly; consumers are
 * expected to convert to camelCase at their boundary.
 *
 * `status` is left as `z.string()` rather than a `z.enum(...)`: the
 * authoritative list of statuses (`not_tried`, `perfect`, `passed`,
 * `submitted`, `review_accepted`, `review_rejected`, …) currently lives
 * in platform's `progress/constants.ts`. Promoting that list into core
 * is a separate refactor — see the call site in `progressSlice.ts`.
 *
 * `result` / `pages_completed[]` entries are numeric `TestResult` codes
 * (also defined in platform's constants). Same story: kept loose here.
 */
export const UnitProgressDefinitionSchema = z.object({
  status: z.string(),
  last_progress_at: z.number().optional(),
  locked: z.boolean().optional(),
  pages_completed: z.array(z.number()).optional(),
  paired: z.boolean().optional(),
  result: z.number().optional(),
  teacher_feedback_commented: z.boolean().optional(),
  teacher_feedback_review_state: z.string().optional(),
  teacher_feedback_new: z.boolean().optional(),
  time_spent: z.number().optional(),
});

/**
 * Optional fields the client may attach to a milestone report. `program`
 * carries the user's code for predict-level reports; `submitted` is a
 * stringified boolean ("true"/"false") for submit/unsubmit toggles.
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
 * Response from `/api/user_progress/:scriptName`. Top-level fields are
 * derived from `script_user.rb#progress_response` in dashboard. Every
 * field is optional because the server omits keys it doesn't have
 * information for (new users, deeperLearningCourse paths, etc).
 */
export const UserProgressResponseSchema = z.object({
  isInstructor: z.boolean().optional(),
  teacherViewingStudent: z.boolean().optional(),
  deeperLearningCourse: z.boolean().optional(),
  focusAreaLessonIds: z.array(z.number()).optional(),
  changeFocusAreaPath: z.string().optional(),
  completed: z.boolean().optional(),
  progress: z.record(z.string(), UnitProgressDefinitionSchema).optional(),
  peerReviewsPerformed: z
    .array(
      z.object({
        status: z.string(),
        name: z.string(),
        result: z.string(),
        icon: z.string(),
        locked: z.boolean(),
      }),
    )
    .optional(),
  current_lesson: z.number().optional(),
});
