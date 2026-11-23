import {z} from 'zod';

import {planSchema} from './planTemplate';
import {stepSchema, stepSourceSchema} from './steps';

/**
 * The unit of progress in a pathway: an ordered sequence of steps that,
 * once complete, returns the student to the map. Checkpoints form a graph
 * through `requires`; one with no `requires` is a root.
 */
export const checkpointSourceSchema = z.strictObject({
  id: z.string().min(1).meta({title: 'Id'}),
  title: z.string().min(1).meta({title: 'Title'}),
  description: z.string().min(1).meta({title: 'Description'}),
  /** Skills this checkpoint develops, by id in the pathway's `skills` map. */
  skillIds: z.array(z.string().min(1)).optional().meta({
    title: 'Skills',
    widget: 'reference',
    options: 'skills.*',
    description:
      "The skills this checkpoint develops, by id in the pathway's skills.",
  }),
  /**
   * A Font Awesome (solid) or kit icon name for the map node, used when no
   * skill in `skillIds` has an icon.
   */
  icon: z.string().min(1).optional().meta({
    title: 'Icon',
    widget: 'icon',
    description:
      'An icon name for the map node, used when none of its skills has one.',
  }),
  /** Checkpoint ids that must be complete before this one unlocks. */
  requires: z.array(z.string().min(1)).optional().meta({
    title: 'Requires',
    widget: 'reference',
    options: 'checkpoints.*.id',
    description:
      'Checkpoint ids that must be complete before this one unlocks. A checkpoint that requires none is a root.',
  }),
  /**
   * The evidence level, by skill in `skillIds`, at which a student has
   * already demonstrated this checkpoint. A skill left out needs evidence
   * level 1.
   */
  targetEvidenceLevels: z
    .record(z.string().min(1), z.number().int().min(1))
    .optional()
    .meta({
      title: 'Target evidence levels',
      keyOptions: '../skillIds.*',
      description:
        'By skill: the evidence level at which a student has already shown this checkpoint. A skill left out needs level 1.',
    }),
  /**
   * Whether a student who has demonstrated this checkpoint may be placed
   * past it. Needs `skillIds`.
   */
  skippable: z.boolean().optional().meta({
    title: 'Skippable',
    description:
      'A student who has shown this checkpoint may be placed past it. Needs skills.',
  }),
  /**
   * Whether finishing this checkpoint returns to the map focused on the
   * next open checkpoint, so the student sees what their evidence skipped.
   */
  routeAfterCompletion: z.boolean().optional().meta({
    title: 'Route after completion',
    description:
      'Finishing this checkpoint returns to the map focused on the next open checkpoint, so the student sees what their evidence skipped.',
  }),
  /**
   * The map destination this checkpoint belongs to: an id in the pathway's
   * `destinations`, or the title itself when the pathway declares none.
   * Only a terminal (leaf) checkpoint, one that no other checkpoint
   * requires, can have one.
   */
  destination: z.string().min(1).optional().meta({
    title: 'Destination',
    widget: 'reference',
    options: 'destinations.*',
    description:
      "An id in the pathway's destinations, or the title itself when it declares none. Only a checkpoint no other requires can have one.",
  }),
  /**
   * The project plan this checkpoint's plan questions fill. Needed by a
   * review step, and by any question that names a plan slot.
   */
  plan: planSchema.optional().meta({
    title: 'Plan',
    description:
      "The project plan this checkpoint's plan questions fill. Needed by a review step and by any question that names a plan slot.",
  }),
  steps: z
    .array(stepSourceSchema.meta({title: 'Step'}))
    .min(1)
    .meta({
      title: 'Steps',
    }),
});

/** A checkpoint as served, with referenced levels resolved. */
export const checkpointSchema = checkpointSourceSchema.extend({
  steps: z.array(stepSchema).min(1),
});
