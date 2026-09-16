import {z} from 'zod';

/** Base schema for all step types. */
export const stepBaseSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  /** The step ID to continue to, or `end` to finish the lesson. */
  next: z.string().min(1).optional(),
});
