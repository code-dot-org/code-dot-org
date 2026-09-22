import {z} from 'zod';

export const questionOptionSchema = z.strictObject({
  id: z.string().min(1),
  label: z.string().min(1),
  correct: z.boolean().optional(),
});

const multipleChoiceQuestionSchema = z.strictObject({
  id: z.string().min(1),
  type: z.literal('multipleChoice'),
  prompt: z.string().min(1),
  options: z.array(questionOptionSchema).min(2),
  multiSelect: z.boolean().optional(),
});

const freeResponseQuestionSchema = z.strictObject({
  id: z.string().min(1),
  type: z.literal('freeResponse'),
  prompt: z.string().min(1),
  placeholder: z.string().optional(),
  /** Copies the answer into the student's project metadata. */
  saveAs: z.enum(['projectTitle', 'projectDescription']).optional(),
});

const scaleQuestionSchema = z.strictObject({
  id: z.string().min(1),
  type: z.literal('scale'),
  prompt: z.string().min(1),
  scale: z.strictObject({
    min: z.number().int(),
    max: z.number().int(),
    minLabel: z.string().optional(),
    maxLabel: z.string().optional(),
  }),
});

/** A question asked as a follow-up inside a branch. Cannot branch again. */
export const followUpQuestionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestionSchema,
  freeResponseQuestionSchema,
  scaleQuestionSchema,
]);

/**
 * What happens after a multiple-choice answer. The first branch whose
 * `optionIds` contains the chosen option applies.
 */
export const questionBranchSchema = z.strictObject({
  optionIds: z.array(z.string().min(1)).min(1),
  /** A text slide shown after the answer. */
  message: z.string().min(1).optional(),
  /** Follow-up questions asked after the answer. */
  questions: z.array(followUpQuestionSchema).optional(),
  /** Checkpoint marked complete when every follow-up is answered correctly. */
  completes: z.string().min(1).optional(),
});

/** Represents a single question in a Question step. */
export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestionSchema.extend({
    branches: z.array(questionBranchSchema).optional(),
  }),
  freeResponseQuestionSchema,
  scaleQuestionSchema,
]);
