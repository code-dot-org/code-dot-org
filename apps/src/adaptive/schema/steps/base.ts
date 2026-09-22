import {z} from 'zod';

/** Base schema for all step types. Steps always play in checkpoint order. */
export const stepBaseSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
});
