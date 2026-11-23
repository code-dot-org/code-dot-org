import {z} from 'zod';

import {checkpointSchema, checkpointSourceSchema} from './checkpoint';
import {destinationSchema} from './destination';
import {finishSchema, finishSourceSchema} from './finish';
import {projectSchema, projectSourceSchema} from './project';
import {skillSchema, skillSourceSchema} from './skill';

/** The map's layout and which way it faces. */
const mapSchema = z.strictObject({
  /**
   * `tree`, the default: rows by dependency depth. `destinations`: checkpoints
   * with a `destination` stacked around the outside, the rest fanning out
   * from the root at the center.
   */
  layout: z.enum(['tree', 'destinations']).optional().meta({
    title: 'Layout',
    description:
      'Tree, the default: rows by dependency depth. Destinations: checkpoints with a destination around the outside, the rest fanning out from the center.',
  }),
  /**
   * The compass direction the layout's top faces: `n` as authored, `e` a
   * quarter turn clockwise, `s` a half turn, `w` three quarters.
   */
  orientation: z.enum(['n', 'e', 's', 'w']).optional().meta({
    title: 'Orientation',
    description:
      'The compass direction the top of the layout faces: n as authored, e a quarter turn clockwise, s a half turn, w three quarters.',
  }),
});

/**
 * Full adaptive pathway schema, as authored in dashboard/config/level_content/adaptive.
 * Drives an entire adaptive pathway experience, whose entrypoint is currently a single
 * Adaptive level.
 */
export const pathwaySourceSchema = z.strictObject({
  formatVersion: z.literal(4).meta({title: 'Format version'}),
  id: z.string().min(1).meta({
    title: 'Id',
    description: "The pathway's id, which is also its content file's name.",
  }),
  title: z.string().min(1).meta({title: 'Title'}),
  objective: z.string().min(1).meta({
    title: 'Objective',
    description: 'What the student comes away able to do.',
  }),
  // Adaptive pathways are built around a single project.
  project: projectSourceSchema.meta({
    title: 'Project',
    description: 'The one project the pathway is built around.',
  }),
  // A pathway's standards are its skills' standards; see pathwayStandards().
  skills: z.record(z.string(), skillSourceSchema).meta({
    title: 'Skills',
    description:
      'The skills the pathway develops, by id. Checkpoints name them in their skills.',
  }),
  checkpoints: z
    .array(checkpointSourceSchema.meta({title: 'Checkpoint'}))
    .min(1)
    .meta({
      title: 'Checkpoints',
      description:
        'The units of progress, each a sequence of steps that returns the student to the map. They form a graph through what each requires.',
    }),
  /**
   * The map's destinations by id, which checkpoints name in `destination`.
   * Without this map a checkpoint's `destination` is the title itself.
   */
  destinations: z.record(z.string().min(1), destinationSchema).optional().meta({
    title: 'Destinations',
    description:
      "The map's destinations by id, which checkpoints name. Without them a checkpoint's destination is its title.",
  }),
  /** How the map is drawn, unless a URL parameter says otherwise. */
  map: mapSchema.optional().meta({
    title: 'Map',
    description:
      'How the map is drawn, unless the page address says otherwise.',
  }),
  /** What I'm finished does; without it the level finishes at once. */
  finish: finishSourceSchema.optional().meta({
    title: "I'm finished",
    description:
      "What I'm finished does. Without it the level finishes at once.",
  }),
});

/**
 * Resolved pathway schema served by the server: skill standards resolved and
 * each referenced level's properties inlined.
 */
export const pathwaySchema = pathwaySourceSchema.extend({
  project: projectSchema,
  skills: z.record(z.string(), skillSchema),
  checkpoints: z.array(checkpointSchema).min(1),
  finish: finishSchema.optional(),
});
