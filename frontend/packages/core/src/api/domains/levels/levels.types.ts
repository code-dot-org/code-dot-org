import {z} from 'zod';
import {
  LevelPropertiesBaseSchema,
  LevelPropertiesMapSchema,
  PredictResponseSchema,
  PredictQuestionTypes,
  SectionSummarySchema,
} from './levels.schemata';

// The inferred base type
export type LevelPropertiesBase = z.infer<typeof LevelPropertiesBaseSchema>;

export type LevelProperties<
  T extends Record<string, unknown> = Record<string, unknown>,
> = LevelPropertiesBase & T;

export type LevelPropertiesMap = z.infer<typeof LevelPropertiesMapSchema>;

export type PredictQuestionType =
  (typeof PredictQuestionTypes)[keyof typeof PredictQuestionTypes];

export type PredictResponse = z.infer<typeof PredictResponseSchema>;
export type SectionSummary = z.infer<typeof SectionSummarySchema>;
