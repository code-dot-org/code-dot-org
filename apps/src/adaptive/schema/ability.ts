import {z} from 'zod';

/** Lab features an ability can turn on. */
export const abilityGrantSchema = z.enum(['aiPrompt', 'htmlEditing']);

/**
 * Something a student can do in the project once a checkpoint that unlocks
 * it is complete. Abilities are unlocked, never lost.
 */
export const abilitySchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  /** Font Awesome icon name. */
  icon: z.string().min(1).optional(),
  grants: abilityGrantSchema.optional(),
});
