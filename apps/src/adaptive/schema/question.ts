import {z} from 'zod';

import {QuizLevelProperties, QuizQuestionSummary} from '@cdo/apps/quiz/types';

import {stepBaseSchema} from './steps/base';
import {subsetOf} from './subsetOf';

/** Quiz's question summary, so the two share views, plus the answer it omits. */
export const multipleChoiceQuestionSchema = subsetOf<
  QuizQuestionSummary & {correctChoiceId: string}
>()(
  z.strictObject({
    id: z.number().int().positive(),
    type: z.literal('MultipleChoiceQuestion'),
    questionName: z.string().min(1),
    stem: z.string().min(1),
    choices: z
      .array(z.strictObject({id: z.string().min(1), text: z.string().min(1)}))
      .min(2),
    correctChoiceId: z.string().min(1),
    page: z.number().int().positive().default(1),
  })
);

/** Represents a single question in a Question step. */
export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestionSchema,
  z.strictObject({
    id: z.string().min(1),
    type: z.literal('freeResponse'),
    text: z.string().min(1),
    placeholder: z.string().optional(),
  }),
  z.strictObject({
    id: z.string().min(1),
    type: z.literal('scale'),
    text: z.string().min(1),
    scale: z.strictObject({
      min: z.number().int(),
      max: z.number().int(),
      minLabel: z.string().optional(),
      maxLabel: z.string().optional(),
    }),
  }),
]);

/** The quiz settings a questions step may set; unset behaves as in quiz. */
export const quizSettingsSchema = subsetOf<Partial<QuizLevelProperties>>()(
  z.strictObject({
    showIntroScreen: z.boolean().optional(),
    showCorrectness: z.boolean().optional(),
    allowMultipleAttempts: z.boolean().optional(),
  })
);

/** A questions step, played as a quiz level whose title is the step's. */
export const questionsStepSchema = stepBaseSchema.extend({
  ...quizSettingsSchema.shape,
  kind: z.literal('questions'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1),
});
