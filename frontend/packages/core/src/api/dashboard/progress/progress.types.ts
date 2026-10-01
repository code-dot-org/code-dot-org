import type {z} from 'zod';

import type {
  HiddenLessonsResponseSchema,
  LevelProgressSchema,
  LockStatusResponseSchema,
  StudentLockStateSchema,
  UserLevelDataSchema,
  UserProgressResponseSchema,
} from './progress.schemata';

export type LevelProgress = z.infer<typeof LevelProgressSchema>;
export type UserProgressResponse = z.infer<typeof UserProgressResponseSchema>;

export type HiddenLessonsResponse = z.infer<typeof HiddenLessonsResponseSchema>;
export type UserLevelData = z.infer<typeof UserLevelDataSchema>;
export type StudentLockState = z.infer<typeof StudentLockStateSchema>;
export type LockStatusResponse = z.infer<typeof LockStatusResponseSchema>;

/** One change POST /api/lock_status applies. */
export interface LockStatusUpdate {
  user_level_data: UserLevelData;
  locked: boolean;
  readonly_answers: boolean;
}
