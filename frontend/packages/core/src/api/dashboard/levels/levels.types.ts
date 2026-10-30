import {z} from 'zod';
import {
  AppOptionsSchema,
  CloneLevelResponseSchema,
  DeleteLevelResponseSchema,
  ExemplarSettingsSchema,
  ExtraLinksLevelDataSchema,
  LevelPropertiesBaseSchema,
  BlocklyLevelPropertiesSchema,
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
export type BlocklyLevelProperties = z.infer<
  typeof BlocklyLevelPropertiesSchema
>;

export type LevelProperties<T = never> = [T] extends [never]
  ? LevelPropertiesBase
  : LevelPropertiesBase & T;

// Input (wire-format) counterparts of the types above. A fixture, or any other
// stand-in for a raw API response, is the data *before* zod transforms and
// defaults run — that is `z.input`, not the inferred `z.output`. Typing
// fixtures against these lets the schema's own validation catch shape errors:
// e.g. `parentLevelLink` is `string | null` here (the wire value), never the
// `string | undefined` the transform produces, and `.default()` fields are
// optional rather than required.
export type LevelPropertiesBaseInput = z.input<
  typeof LevelPropertiesBaseSchema
>;

export type LevelPropertiesInput<T = never> = [T] extends [never]
  ? LevelPropertiesBaseInput
  : LevelPropertiesBaseInput & T;

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
export type CloneLevelResponse = z.infer<typeof CloneLevelResponseSchema>;
export type DeleteLevelResponse = z.infer<typeof DeleteLevelResponseSchema>;

export interface UnitLevelPropertiesRequestParams {
  levelId?: number;
  standaloneProjectType?: never;
  scriptName?: string;
  lessonPosition?: number;
}

export interface ProjectLevelPropertiesRequestParams {
  levelId?: never;
  standaloneProjectType: string;
  scriptName?: never;
  lessonPosition?: never;
}

export type LevelPropertiesRequestParams =
  | UnitLevelPropertiesRequestParams
  | ProjectLevelPropertiesRequestParams;
