import {z} from 'zod';

import {checkpointSchema, checkpointSourceSchema} from './checkpoint';

/** The dialog that asks before the pathway is left for good. */
export const finishDialogSchema = z.strictObject({
  title: z.string().min(1).meta({title: 'Title'}),
  body: z.string().min(1).meta({title: 'Body'}),
  /** The button that goes on; "Finish" when absent. */
  finishLabel: z.string().min(1).optional().meta({
    title: 'Finish button',
    description: '"Finish" when not set.',
  }),
  /** The button that stays; "Keep Working" when absent. */
  cancelLabel: z.string().min(1).optional().meta({
    title: 'Cancel button',
    description: '"Keep Working" when not set.',
  }),
});

/**
 * What I'm finished does, in order, each part skipped when absent: ask
 * through `dialog`, play `checkpoint`, then finish the level the way any
 * Lab2 level does. The checkpoint is not one of the pathway's `checkpoints`:
 * it is reached only this way and has no place on the map.
 */
export const finishSourceSchema = z.strictObject({
  dialog: finishDialogSchema.optional().meta({
    title: 'Dialog',
    description: 'Asks before the pathway is left for good.',
  }),
  checkpoint: checkpointSourceSchema.optional().meta({
    title: 'Checkpoint',
    description:
      'Played after the dialog. It is reached only this way and has no place on the map.',
  }),
});

/** The finish block as served, its checkpoint's levels resolved. */
export const finishSchema = finishSourceSchema.extend({
  checkpoint: checkpointSchema.optional(),
});
