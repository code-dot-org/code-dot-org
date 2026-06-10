import {z} from 'zod';

import {
  InstructionTypes,
  InstructorAudiences,
  LessonGroupSummarySchema,
  LessonSchema,
  LessonSummarySchema,
  LevelKinds,
  LevelSchema,
  ParticipantAudiences,
  PublishedStates,
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
export type PublishedState =
  (typeof PublishedStates)[keyof typeof PublishedStates];
export type ParticipantAudience =
  (typeof ParticipantAudiences)[keyof typeof ParticipantAudiences];
export type InstructionType =
  (typeof InstructionTypes)[keyof typeof InstructionTypes];
export type InstructorAudience =
  (typeof InstructorAudiences)[keyof typeof InstructorAudiences];
