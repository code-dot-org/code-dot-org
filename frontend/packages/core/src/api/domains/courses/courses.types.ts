import {z} from 'zod';

import {
  LessonGroupSummarySchema,
  LessonSchema,
  LessonSummarySchema,
  LevelKinds,
  LevelSchema,
  SublevelSchema,
  UnitLevelSchema,
  UnitSummarySchema,
  UnitShortSummarySchema,
} from './courses.schemata';

export type LessonGroupSummary = z.infer<typeof LessonGroupSummarySchema>;
export type UnitSummary = z.infer<typeof UnitSummarySchema>;
export type UnitShortSummary = z.infer<typeof UnitShortSummarySchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type LessonSummary = z.infer<typeof LessonSummarySchema>;
export type Level = z.infer<typeof LevelSchema>;
export type Sublevel = z.infer<typeof SublevelSchema>;
export type UnitLevel = z.infer<typeof UnitLevelSchema>;
export type LevelKind = (typeof LevelKinds)[keyof typeof LevelKinds];
