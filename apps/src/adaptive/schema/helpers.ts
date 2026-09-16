// Small pure functions over parsed content that more than one caller needs.

import {z} from 'zod';

import {pathwaySchema} from './pathway';
import {stepSchema} from './steps';

type Step = z.infer<typeof stepSchema>;
type Pathway = z.infer<typeof pathwaySchema>;
type ResolvedStandard = NonNullable<
  Pathway['skills'][string]['standards']
>[number];

/**
 * Skill ids a pathway's skill trees reference, in first-seen order. The
 * server uses the same rule to decide which skill files to inline.
 */
export function referencedSkillIds(steps: readonly Step[]): string[] {
  const ids: string[] = [];
  for (const step of steps) {
    if (step.kind !== 'skillTree') continue;
    for (const ref of step.skills) {
      if (!ids.includes(ref.skillId)) ids.push(ref.skillId);
    }
  }
  return ids;
}

/**
 * The standards a served pathway addresses: the union of its skills'
 * resolved standards, deduplicated by framework and shortcode, in the order
 * the skill trees reference the skills. A pathway declares none of its own.
 */
export function pathwayStandards(pathway: Pathway): ResolvedStandard[] {
  const seen = new Set<string>();
  const out: ResolvedStandard[] = [];
  for (const skillId of referencedSkillIds(pathway.steps)) {
    for (const standard of pathway.skills[skillId]?.standards || []) {
      const key = `${standard.framework}/${standard.shortcode}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(standard);
    }
  }
  return out;
}
