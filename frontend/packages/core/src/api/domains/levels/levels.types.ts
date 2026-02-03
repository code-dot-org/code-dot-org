import {z} from 'zod';
import {
  AppOptionsSchema,
  ExemplarSettingsSchema,
  ExtraLinksLevelDataSchema,
  LevelPropertiesBaseSchema,
  LevelPropertiesMapSchema,
  ParentLevelPathLinkSchema,
  PredictResponseSchema,
  PredictQuestionTypes,
  ScriptLevelPathLinkSchema,
  SectionSummarySchema,
  UserAppOptionsSchema,
} from './levels.schemata';

// The inferred base type
export type LevelPropertiesBase = z.infer<typeof LevelPropertiesBaseSchema>;

export type LevelProperties<
  T extends Record<string, unknown> = Record<string, unknown>,
> = LevelPropertiesBase & T;

export type LevelPropertiesMap = z.infer<typeof LevelPropertiesMapSchema>;

export type PredictQuestionType =
  (typeof PredictQuestionTypes)[keyof typeof PredictQuestionTypes];

export type AppOptions = z.infer<typeof AppOptionsSchema>;
export type ExtraLinksLevelData = z.infer<typeof ExtraLinksLevelDataSchema>;
export type ParentLevelPathLink = z.infer<typeof ParentLevelPathLinkSchema>;
export type PredictResponse = z.infer<typeof PredictResponseSchema>;
export type SectionSummary = z.infer<typeof SectionSummarySchema>;
export type ScriptLevelPathLink = z.infer<typeof ScriptLevelPathLinkSchema>;
export type UserAppOptions = z.infer<typeof UserAppOptionsSchema>;
export type ExemplarSettings = z.infer<typeof ExemplarSettingsSchema>;
