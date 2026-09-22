// Small pure functions over parsed content that more than one caller needs.

import {z} from 'zod';

import {pathwaySchema} from './pathway';

type Pathway = z.infer<typeof pathwaySchema>;
type ResolvedStandard = NonNullable<
  Pathway['skills'][string]['standards']
>[number];

/** Skill ids the checkpoints reference, in first-seen order. */
export function referencedSkillIds(pathway: Pathway): string[] {
  const ids: string[] = [];
  for (const checkpoint of pathway.checkpoints) {
    for (const id of checkpoint.skillIds || []) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

/**
 * The standards a served pathway addresses: the union of its referenced
 * skills' standards, deduplicated by framework and shortcode.
 */
export function pathwayStandards(pathway: Pathway): ResolvedStandard[] {
  const seen = new Set<string>();
  const out: ResolvedStandard[] = [];
  for (const skillId of referencedSkillIds(pathway)) {
    for (const standard of pathway.skills[skillId]?.standards || []) {
      const key = `${standard.framework}/${standard.shortcode}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(standard);
    }
  }
  return out;
}
