import {z} from 'zod';

import {stepBaseSchema} from './base';

/** Skill reference in a skill tree. Configures the skill's placement and requirements. */
export const skillTreeSkillRefSchema = z.strictObject({
  skillId: z.string().min(1),
  /** The checkpoint ID that must be completed to progress past this skill. */
  requiredCheckpointId: z.string().min(1),
  /** Whether completing the skill is required for progression. */
  required: z.boolean().default(true),
});

/** A skill tree step. Composed of a list of skill references, and progression requirements. */
export const skillTreeStepSchema = stepBaseSchema.extend({
  kind: z.literal('skillTree'),
  description: z.string().optional(),
  skills: z.array(skillTreeSkillRefSchema).min(1),
});
