import {z} from 'zod';

import {LevelProperties} from '../lab2/types';

import {
  checkpointSchema,
  levelStepSchema,
  panelsStepSchema,
  pathwaySchema,
  questionSchema,
  questionsStepSchema,
  skillSchema,
  stepSchema,
} from './schema';

export type Pathway = z.infer<typeof pathwaySchema>;
export type Checkpoint = z.infer<typeof checkpointSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Step = z.infer<typeof stepSchema>;
export type PanelsStep = z.infer<typeof panelsStepSchema>;
export type LevelStep = z.infer<typeof levelStepSchema>;
export type QuestionsStep = z.infer<typeof questionsStepSchema>;
export type Question = z.infer<typeof questionSchema>;
export type MultipleChoiceQuestion = Extract<
  Question,
  {type: 'multipleChoice'}
>;

export interface AdaptiveLevelProperties extends LevelProperties {
  adaptiveId?: string;
  /** Adaptive pathway content. */
  pathway?: Pathway;
}
