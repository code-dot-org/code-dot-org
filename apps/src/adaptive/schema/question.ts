import {z} from 'zod';

import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

import {stepBaseSchema} from './steps/base';
import {subsetOf} from './subsetOf';

/**
 * A multiple-choice question, shaped like the quiz levels' question so the
 * two can share views; the summary omits the answer key, so it is added.
 */
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
    // Quiz levels paginate; a questions step shows one question at a time.
    page: z.number().int().default(1),
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

/** A questions step. */
export const questionsStepSchema = stepBaseSchema.extend({
  kind: z.literal('questions'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1),
});
