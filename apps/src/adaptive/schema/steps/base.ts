import {z} from 'zod';

/** Base schema for all step types. */
export const stepBaseSchema = z.strictObject({
  id: z.string().min(1).meta({title: 'Id'}),
  title: z.string().min(1).meta({title: 'Title'}),
  /**
   * Played only while `choiceId` is the latest answer to question
   * `questionId` of an earlier questions step `stepId` in the same
   * checkpoint. OTHER_CHOICE_ID names a typed answer.
   */
  showIf: z
    .strictObject({
      stepId: z.string().min(1).meta({
        title: 'Questions step',
        widget: 'reference',
        options: '../../../*.id',
      }),
      questionId: z.number().int().positive().meta({title: 'Question id'}),
      choiceId: z.string().min(1).meta({
        title: 'Choice id',
        description: '"other" names a typed answer.',
      }),
    })
    .optional()
    .meta({
      title: 'Show only if',
      description:
        'Played only while this choice is the latest answer to this question of an earlier questions step in the checkpoint.',
    }),
});
