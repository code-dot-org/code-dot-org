import {z} from 'zod';

import {LevelProperties} from '@cdo/apps/lab2/types';
// Not the barrel: it drags Lab2Registry into the level editor bundle.
import {coerceStringBooleans} from '@cdo/apps/lab2/utils/coerceStringBooleans';

import {stepBaseSchema} from './base';

/**
 * Lab2 level properties as the server serializes them. Only the keys every
 * lab needs are checked; the rest of the shape is the lab's business. String
 * booleans are coerced as the level properties request does for a top-level
 * level, so an inlined level reads the same way to its lab.
 */
export const levelPropertiesSchema = z
  .custom<LevelProperties>(
    value =>
      typeof value === 'object' &&
      value !== null &&
      typeof (value as LevelProperties).id === 'number' &&
      typeof (value as LevelProperties).appName === 'string',
    {message: 'expected Lab2 level properties with a numeric id and appName'}
  )
  .transform((value): LevelProperties => coerceStringBooleans(value));

/**
 * How a project step's work is judged: the work done in the step is checked
 * against `condition` for a pass, and rated on the skill in `measures` using
 * that skill's evidence levels.
 */
export const validationSchema = z.strictObject({
  /** What the work must show to pass, written to the student. */
  condition: z.string().min(1).meta({
    title: 'Condition',
    description: 'What the work must show to pass, written to the student.',
  }),
  /**
   * The skill the work is rated on, by id. Must be one of the checkpoint's
   * `skillIds` and describe `evidenceLevels`.
   */
  measures: z
    .strictObject({skillId: z.string().min(1).meta({title: 'Skill id'})})
    .meta({
      title: 'Measures',
      description:
        "The skill the work is rated on. Must be one of the checkpoint's skills and describe evidence levels.",
    }),
});

/**
 * A step that plays an existing level. A level whose project template is the
 * pathway's template edits the student's project; any other level is a
 * sandbox with code of its own.
 */
export const levelStepSourceSchema = stepBaseSchema
  .extend({
    kind: z.literal('level'),
    /** Name of the level to play. */
    level: z
      .string()
      .min(1)
      .meta({title: 'Level', description: 'Name of the level to play.'}),
    /**
     * Replaces the level's own instructions when set. Also what the student
     * sees when `instructionsPrompt` generation is off or fails.
     */
    instructions: z.string().min(1).optional().meta({
      title: 'Instructions',
      description:
        "Replaces the level's own instructions. Also what the student sees when generated instructions are off or fail.",
    }),
    /**
     * Brief for generating this step's instructions around the student's own
     * project. Only on project steps.
     */
    instructionsPrompt: z.string().min(1).optional().meta({
      title: 'Instructions prompt',
      description:
        "Brief for generating this step's instructions around the student's project. Project steps only.",
    }),
    /**
     * Brief for building the student's first version of the project from
     * their plan. Runs when the student asks for a build on the review step
     * before this one, replacing what is there. Only on project steps.
     */
    projectPrompt: z.string().min(1).optional().meta({
      title: 'Project prompt',
      description:
        "Brief for building the student's first version of the project from their plan, when they ask on the review step before. Project steps only.",
    }),
    /**
     * Marks a step that edits the student's project. Its level must name the
     * pathway's template level as its project template; a step without this
     * flag must not. Absent for sandboxes.
     */
    project: z.literal(true).optional().meta({
      title: 'Project step',
      description:
        "The step edits the student's project. Its level names the pathway's template level as its project template.",
    }),
    /** How the student's work on this step is judged. Only on project steps. */
    validation: validationSchema.optional().meta({
      title: 'Validation',
      description:
        "How the student's work on this step is judged. Project steps only.",
    }),
  })
  .meta({title: 'Level'});

/** A level step as served, with the referenced level's properties inlined. */
export const levelStepSchema = levelStepSourceSchema.extend({
  /** Absent when the server found no level by that name. */
  levelProperties: levelPropertiesSchema.optional(),
});
