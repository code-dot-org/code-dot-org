import {z} from 'zod';

/** Reference to a standard in the Standards table. */
export const standardRefSchema = z.strictObject({
  framework: z.string().min(1),
  shortcode: z.string().min(1),
});

/** Fully resolved standard content; composed by the server when sending the adaptive pathway the client. */
export const resolvedStandardSchema = standardRefSchema.extend({
  frameworkName: z.string().min(1),
  description: z.string().min(1),
  categoryShortcode: z.string().optional(),
  categoryDescription: z.string().optional(),
  parentCategoryShortcode: z.string().optional(),
  parentCategoryDescription: z.string().optional(),
});
