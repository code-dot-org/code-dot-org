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

/**
 * GET /s/:script/hidden_lessons (ScriptLevelsController#hidden_lesson_ids).
 * An instructor gets hidden lesson ids by section id; a participant, the ids
 * hidden for them across their sections.
 */
export const HiddenLessonsResponseSchema = z.union([
  z.array(z.number()),
  z.record(z.string(), z.array(z.number())),
]);

/** Enough to find, or create, the student's UserLevel for a lockable lesson. */
export const UserLevelDataSchema = z.object({
  user_id: z.number(),
  level_id: z.number(),
  script_id: z.number(),
});

/** One student's lock state in a lockable lesson (Lesson#lockable_state). */
export const StudentLockStateSchema = z
  .object({
    user_level_data: UserLevelDataSchema,
    name: z.string(),
    locked: z.boolean(),
    readonly_answers: z.boolean(),
    is_demo_student: z.boolean().optional(),
  })
  .passthrough();

/**
 * GET /api/lock_status (ApiController#lockable_state): for each section the
 * signed-in user instructs, keyed by section id, the lock state of each
 * student in each lockable lesson, keyed by lesson id. A signed-out user
 * gets {}.
 */
export const LockStatusResponseSchema = z.record(
  z.string(),
  z
    .object({
      section_id: z.number(),
      section_name: z.string(),
      ai_chat_access_level: z.string().optional(),
      lessons: z.record(z.string(), z.array(StudentLockStateSchema)),
    })
    .passthrough(),
);
