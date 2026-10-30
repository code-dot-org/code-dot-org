import {z} from 'zod';

/** Base schema for all step types. */
export const stepBaseSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  /**
   * Played only while `choiceId` is the latest answer to question
   * `questionId` of an earlier questions step `stepId` in the same
   * checkpoint. OTHER_CHOICE_ID names a typed answer.
   */
  showIf: z
    .strictObject({
      stepId: z.string().min(1),
      questionId: z.number().int().positive(),
      choiceId: z.string().min(1),
    })
    .optional(),
});
