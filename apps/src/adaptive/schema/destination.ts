import {z} from 'zod';

/** The design system color families a destination may be drawn in. */
export const DESTINATION_COLORS = [
  'purple',
  'teal',
  'green',
  'blue',
  'orange',
  'strawberry',
] as const;

export type DestinationColor = (typeof DESTINATION_COLORS)[number];

/**
 * A destination on the map: a titled box the checkpoints naming it are
 * grouped in, with a color and an icon of its own.
 */
export const destinationSchema = z.strictObject({
  title: z.string().min(1),
  /** A Font Awesome icon name, solid style, shown beside the title. */
  icon: z.string().min(1).optional(),
  color: z.enum(DESTINATION_COLORS).optional(),
});
