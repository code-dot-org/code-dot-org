import {z} from 'zod';

import {ProjectTypes} from '../projects';

export const PredictQuestionTypes = {
  FreeResponse: 'freeResponse',
  MultipleChoice: 'multipleChoice',
} as const;

import {MultiFileSourceSchema, ProjectSourcesSchema} from '../sources';

export const LevelPredictSettingsSchema = z.object({
  isPredictLevel: z.boolean(),
  solution: z.string().optional(),
  questionType: z.enum(Object.values(PredictQuestionTypes)).optional(),
  allowMultipleAttempts: z.boolean().optional(),
  codeEditableAfterSubmit: z.boolean().optional(),
  // Free Response settings
  freeResponseHeight: z.number().optional(),
  placeholderText: z.string().optional(),
  // Multiple choice settings
  multipleChoiceOptions: z.array(z.string()).optional(),
  isMultiSelect: z.boolean().optional(),
});

export const ExemplarSettingsSchema = z.object({
  validationEnabled: z.boolean(),
  validationSuccessMessage: z.string(),
  validationFailureMessage: z.string(),
});

/**
 * Fields common to every level.
 *
 * This can be extended in the type form `LevelProperties<T>`.
 */
export const LevelPropertiesBaseSchema = z.object({
  id: z.number(),
  appName: z.enum(ProjectTypes),
  longInstructions: z.string().optional(),
  shortInstructions: z.string().optional(),
  instructionsImportant: z.boolean().optional(),
  isProjectLevel: z.boolean().optional(),
  hideShareAndRemix: z.boolean().optional(),
  usesProjects: z.boolean().optional(),
  startSources: MultiFileSourceSchema.optional(),
  multipleChoice: z.boolean().optional(),
  templateSources: MultiFileSourceSchema.optional(),
  exemplarSources: z
    .union([ProjectSourcesSchema, MultiFileSourceSchema])
    .nullable(),
  hideVersionHistory: z.boolean().optional(),
  aiTutorAvailable: z.boolean().optional(),
  showRubric: z.boolean().optional(),
  // Project Template level name for the level if it exists.
  projectTemplateLevelName: z.string().optional(),
  // For Teachers Only value
  teacherMarkdown: z.string().optional(),
  predictSettings: LevelPredictSettingsSchema.optional(),
  exemplarSettings: ExemplarSettingsSchema.optional(),
  submittable: z.boolean().optional(),
  disableEditRunForSubmission: z.boolean().optional(),
  skipUrl: z.string().optional(),
  finishUrl: z.string().optional(),
  finishDialog: z.string().optional(),
  offerBrowserTts: z.boolean().optional(),
  useSecondaryFinishButton: z.boolean().optional(),
  // Codebridge
  widgetView: z.boolean().optional(),
  // Extra data
  levelData: z.object(),
});

export const LevelPropertiesMapSchema = z.record(
  z.string(),
  LevelPropertiesBaseSchema,
);

export const PredictResponseSchema = z.object({
  data: z.string(),
});

export const SectionSummarySchema = z.object({
  response_count: z.number(),
  num_students: z.number(),
});

export const ScriptLevelPathLinkSchema = z.object({
  script: z.string(),
  path: z.string(),
});

export const ParentLevelPathLinkSchema = z.object({
  level_name: z.string(),
  path: z.string(),
  kind: z.string(),
  position: z.string(),
});

export const ExtraLinksLevelDataSchema = z.object({
  links: z.record(
    z.string(),
    z.array(
      z.object({
        text: z.string(),
        url: z.string(),
        access_key: z.string().optional(),
      }),
    ),
  ),
  can_clone: z.boolean(),
  can_delete: z.boolean(),
  level_name: z.string(),
  script_level_path_links: z.array(ScriptLevelPathLinkSchema),
  parent_level_path_links: z.array(ParentLevelPathLinkSchema),
  is_standalone_project: z.boolean(),
});

export const AppOptionsSchema = z.object({
  levelId: z.number(),
  channel: z.string().nullable(),
  editBlocks: z.string().optional(),
  isEditingExemplar: z.boolean().optional(),
  isViewingExemplar: z.boolean().optional(),
  share: z.boolean().optional(),
  theme: z.string().optional(),
  publicCaching: z.boolean().nullable(),
  dialog: z
    .object({
      skipSound: z.boolean(),
      preTitle: z.string().nullable(),
      fallbackResponse: z.string().nullable(),
      callback: z.string().nullable(),
      sublevelCallback: z.string().nullable(),
      app: z.string(),
      level: z.string(),
      shouldShowDialog: z.boolean(),
    })
    .optional(),
  experiments: z.array(z.string()).optional(),
  usingTextModePref: z.boolean().optional(),
  muteMusic: z.boolean().optional(),
  displayTheme: z.string().nullable(),
  userSharingDisabled: z.boolean().optional(),
  isSignedIn: z.boolean(),
});

export const UserAppOptionsSchema = z.object({
  signedIn: z.boolean(),
  isInstructor: z.boolean().optional(),
  isStarted: z.boolean().optional(),
  skipInstructionsPopup: z.boolean().optional(),
  callouts: z.array(z.string()).optional(),
  disableSocialShare: z.boolean().optional(),
  channel: z.string().optional(),
  reduceChannelUpdates: z.boolean().optional(),
});
