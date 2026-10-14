import {z} from 'zod';

import {stepBaseSchema} from './base';

/** A video step as authored: references a Video record by key. */
export const videoStepSourceSchema = stepBaseSchema.extend({
  kind: z.literal('video'),
  videoKey: z.string().min(1),
});

/**
 * A video step as served: videoKey is preserved and the server has inlined the
 * resolved URLs so the client can play the video without a second request.
 */
export const videoStepSchema = videoStepSourceSchema.extend({
  src: z.string().optional(), // YouTube embed URL
  download: z.string().optional(), // MP4 download URL
  thumbnail: z.string().optional(), // Poster image URL
});
