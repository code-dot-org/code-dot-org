import {z} from 'zod';

import {stepBaseSchema} from './base';

/** What a student decides on a review step, saved as its answer id. */
export const REVIEW_DECISIONS = ['build', 'skip'] as const;

export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

/**
 * A step that shows the student their plan, the checkpoint's template
 * filled from their answers so far, and asks whether to build a first
 * version of the project from it or skip to editing by hand. Building
 * happens on the next project step with a `projectPrompt`.
 */
export const reviewStepSchema = stepBaseSchema
  .extend({
    kind: z.literal('review'),
    description: z.string().min(1).optional().meta({title: 'Description'}),
    /** The question id the decision is saved under; unique like any other. */
    questionId: z.number().int().positive().meta({
      title: 'Question id',
      description:
        'The id the decision is saved under, unique like any question id.',
    }),
    buildLabel: z.string().min(1).optional().meta({title: 'Build button'}),
    skipLabel: z.string().min(1).optional().meta({title: 'Skip button'}),
  })
  .meta({title: 'Review'});
