import type {z} from 'zod';

import type {
  LevelProgressSchema,
  UserProgressResponseSchema,
} from './progress.schemata';

export type LevelProgress = z.infer<typeof LevelProgressSchema>;
export type UserProgressResponse = z.infer<typeof UserProgressResponseSchema>;
