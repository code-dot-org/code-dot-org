// Small pure functions over parsed content that more than one caller needs.

import {z} from 'zod';

import {pathwaySchema} from './pathway';

type Pathway = z.infer<typeof pathwaySchema>;
type Checkpoint = Pathway['checkpoints'][number];
type ResolvedStandard = NonNullable<
  Pathway['skills'][string]['standards']
>[number];

/**
 * Checkpoints in progression order: by the length of the longest `requires`
 * chain beneath each one, so roots come first and every checkpoint follows
 * everything it requires. Ties keep authored order. The array order in the
 * file carries no meaning of its own.
 */
export function checkpointsInProgressionOrder(pathway: Pathway): Checkpoint[] {
  const byId = new Map(pathway.checkpoints.map(c => [c.id, c]));
  const depthOf = new Map<string, number>();
  const depth = (id: string, path: Set<string>): number => {
    const known = depthOf.get(id);
    if (known !== undefined) return known;
    const requires = (byId.get(id)?.requires || []).filter(
      r => byId.has(r) && !path.has(r)
    );
    const result = requires.length
      ? 1 + Math.max(...requires.map(r => depth(r, new Set(path).add(id))))
      : 0;
    depthOf.set(id, result);
    return result;
  };
  return pathway.checkpoints
    .map((checkpoint, index) => ({
      checkpoint,
      index,
      depth: depth(checkpoint.id, new Set([checkpoint.id])),
    }))
    .sort((a, b) => a.depth - b.depth || a.index - b.index)
    .map(entry => entry.checkpoint);
}

/** Skill ids the checkpoints reference, once each, in progression order. */
export function referencedSkillIds(pathway: Pathway): string[] {
  const ids: string[] = [];
  for (const checkpoint of checkpointsInProgressionOrder(pathway)) {
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
