import {z} from 'zod';

import {LevelProperties} from '../lab2/types';

import {
  checkpointSchema,
  finishDialogSchema,
  freeResponseQuestionSchema,
  levelStepSchema,
  markdownStepSchema,
  multipleChoiceDiagnosticQuestionSchema,
  panelsStepSchema,
  pathwaySchema,
  questionSchema,
  questionsStepSchema,
  reviewStepSchema,
  skillSchema,
  statsStepSchema,
  stepSchema,
  videoStepSchema,
} from './schema';

export type Pathway = z.infer<typeof pathwaySchema>;
export type Checkpoint = z.infer<typeof checkpointSchema>;
export type FinishDialogContent = z.infer<typeof finishDialogSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Step = z.infer<typeof stepSchema>;
export type PanelsStep = z.infer<typeof panelsStepSchema>;
export type LevelStep = z.infer<typeof levelStepSchema>;
export type MarkdownStep = z.infer<typeof markdownStepSchema>;
export type StatsStep = z.infer<typeof statsStepSchema>;
export type QuestionsStep = z.infer<typeof questionsStepSchema>;
export type ReviewStep = z.infer<typeof reviewStepSchema>;
export type VideoStep = z.infer<typeof videoStepSchema>;
export type Question = z.infer<typeof questionSchema>;
export type MultipleChoiceDiagnosticQuestion = z.infer<
  typeof multipleChoiceDiagnosticQuestionSchema
>;
export type FreeResponseQuestion = z.infer<typeof freeResponseQuestionSchema>;

/** What a student has said about their project, as every adaptive surface reads it. */
export interface PathwayProjectInfo {
  name?: string;
  description?: string;
}

export interface AdaptiveLevelProperties extends LevelProperties {
  adaptiveId?: string;
  /** Adaptive pathway content. */
  pathway?: Pathway;
}
