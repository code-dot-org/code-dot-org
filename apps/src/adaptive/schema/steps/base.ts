import {z} from 'zod';

/** Base schema for all step types. */
export const stepBaseSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
});
