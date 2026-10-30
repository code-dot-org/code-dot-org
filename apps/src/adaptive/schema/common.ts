import {z} from 'zod';

/** Reference to a standard in the Standards table. */
export const standardRefSchema = z.strictObject({
  framework: z.string().min(1),
  shortcode: z.string().min(1),
});

/**
 * A standard as served: the reference plus the description the server
 * resolved for it. Every resolved field is optional because the server passes
 * a reference it cannot resolve through unchanged, and one bad reference must
 * not make the whole pathway unparseable.
 */
export const resolvedStandardSchema = standardRefSchema.extend({
  frameworkName: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  categoryShortcode: z.string().optional(),
  categoryDescription: z.string().optional(),
  parentCategoryShortcode: z.string().optional(),
  parentCategoryDescription: z.string().optional(),
});
