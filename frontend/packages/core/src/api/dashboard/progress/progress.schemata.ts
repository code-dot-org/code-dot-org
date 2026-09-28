import {z} from 'zod';

/**
 * One level's entry in /api/user_progress, as
 * UsersHelper#get_level_progress builds it. Nil fields are compacted away, so
 * every field is optional: an unattempted level in a lockable lesson is just
 * `{locked: true}`.
 */
export const LevelProgressSchema = z
  .object({
    status: z.string().optional(),
    result: z.number().optional(),
    locked: z.boolean().optional(),
    paired: z.boolean().optional(),
    last_progress_at: z.number().optional(),
    time_spent: z.number().optional(),
    // One entry per page of a multi-page LevelGroup; null for an unattempted
    // page.
    pages_completed: z.array(z.number().nullable()).nullable().optional(),
    teacher_feedback_review_state: z.string().nullable().optional(),
    teacher_feedback_commented: z.boolean().optional(),
    teacher_feedback_new: z.boolean().optional(),
  })
  .passthrough();

/**
 * GET /api/user_progress/:script (ApiController#user_progress,
 * UsersHelper#summarize_user_progress). Keys keep the server's mixed casing.
 * A signed-out user gets only `signedIn: false`.
 */
export const UserProgressResponseSchema = z
  .object({
    signedIn: z.boolean().optional(),
    teacherViewingStudent: z.boolean().optional(),
    disableSocialShare: z.boolean().optional(),
    lockableAuthorized: z.boolean().optional(),
    isTeacher: z.boolean().optional(),
    isInstructor: z.boolean().optional(),
    isVerifiedInstructor: z.boolean().optional(),
    deeperLearningCourse: z.boolean().optional(),
    focusAreaLessonIds: z.array(z.number()).optional(),
    changeFocusAreaPath: z.string().optional(),
    completed: z.boolean().optional(),
    // Keyed by level id.
    progress: z.record(z.string(), LevelProgressSchema).optional(),
    peerReviewsPerformed: z.array(z.record(z.string(), z.unknown())).optional(),
    current_lesson: z.number().optional(),
  })
  .passthrough();
