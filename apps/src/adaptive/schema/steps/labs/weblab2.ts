import {z} from 'zod';

/** Weblab2-specific step properties. A subset of Weblab2's level properties. */
export const weblab2LabSchema = z.strictObject({
  type: z.literal('weblab2'),
  starterFiles: z.record(z.string().min(1), z.string()).optional(),
  initialViewMode: z.enum(['split', 'code', 'preview']).optional(),
});
