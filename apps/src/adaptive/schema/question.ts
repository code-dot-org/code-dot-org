import {z} from 'zod';

import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

import {stepBaseSchema} from './steps/base';
import {subsetOf} from './subsetOf';

/**
 * What a question's answer says about one skill. A graded question, one with
 * `correctChoiceId`, measures `evidenceLevel` when answered correctly and
 * nothing otherwise; a survey question measures the level listed for the
 * chosen choice. Level 0 is no evidence.
 */
export const measuresSchema = z.union([
  z.strictObject({
    skillId: z.string().min(1),
    evidenceLevel: z.number().int().min(1),
  }),
  z.strictObject({
    skillId: z.string().min(1),
    /** Evidence level by choice id. A choice left out measures nothing. */
    evidenceLevels: z.record(z.string().min(1), z.number().int().min(0)),
  }),
]);

/** What a question's answer says about one skill. */
export type Measures = z.infer<typeof measuresSchema>;

/** A multiple choice question that does not rely on Quiz BE (but looks like a Quiz).
 * This should be used for diagnostics and surveys and Quiz backed levels (when implemented)
 * should be used for evaluation.
 */
export const multipleChoiceDiagnosticQuestionSchema = subsetOf<
  Omit<QuizQuestionSummary, 'page'> & {
    correctChoiceId?: string;
    measures?: Measures;
  }
>()(
  z.strictObject({
    id: z.number().int().positive(),
    type: z.literal('MultipleChoiceQuestion'),
    questionName: z.string().min(1),
    questionTitle: z.string().min(1),
    choices: z
      .array(z.strictObject({id: z.string().min(1), text: z.string().min(1)}))
      .min(2),
    /**
     * When supplied, the student retries until correct.
     * Otherwise any option allows the student to continue.
     */
    correctChoiceId: z.string().min(1).optional(),
    measures: measuresSchema.optional(),
  })
);

/** One of a questions step's questions. */
export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceDiagnosticQuestionSchema,
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

/** A questions step, played one question at a time in order. */
export const questionsStepSchema = stepBaseSchema.extend({
  kind: z.literal('questions'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1),
});
