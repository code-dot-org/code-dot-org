// Checks the schemas alone cannot make: skill references, checkpoint graph
// shape, and whether each project-mode lab step fits the pathway's project.

import {z} from 'zod';

import {pathwaySchema} from '../pathway';

type Pathway = z.infer<typeof pathwaySchema>;

/**
 * Detects and returns any reference problems in a pathway.
 */
export function referenceProblems(pathway: Pathway): string[] {
  return [
    ...skillProblems(pathway),
    ...checkpointProblems(pathway),
    ...projectStepProblems(pathway),
  ];
}

/**
 * Detects and returns any problems with skills: map keys must match ids and
 * checkpoints may only reference skills in the map.
 */
function skillProblems(pathway: Pathway): string[] {
  const problems: string[] = [];
  for (const [skillId, skill] of Object.entries(pathway.skills)) {
    if (skill.id !== skillId) {
      problems.push(`skills.${skillId}: id '${skill.id}' does not match key`);
    }
  }
  for (const checkpoint of pathway.checkpoints) {
    for (const skillId of checkpoint.skillIds || []) {
      if (!pathway.skills[skillId]) {
        problems.push(
          `checkpoints.${checkpoint.id}.skillIds: unknown skill '${skillId}'`
        );
      }
    }
  }
  return problems;
}

/**
 * Detects and returns any problems with the checkpoint graph: ids are
 * unique, `requires` name known checkpoints, at least one checkpoint is a
 * root, and every checkpoint can eventually unlock, meaning its `requires`
 * chains all lead back to a root rather than looping.
 */
function checkpointProblems(pathway: Pathway): string[] {
  const where = 'checkpoints';
  const problems: string[] = [];
  const ids = new Set(pathway.checkpoints.map(c => c.id));
  if (ids.size !== pathway.checkpoints.length) {
    problems.push(`${where}: ids must be unique`);
  }
  if (!pathway.checkpoints.some(c => !c.requires?.length)) {
    problems.push(`${where}: no root (every checkpoint has requires)`);
  }

  const unknownRequires = new Set<string>();
  for (const checkpoint of pathway.checkpoints) {
    for (const req of checkpoint.requires || []) {
      if (!ids.has(req)) {
        unknownRequires.add(checkpoint.id);
        problems.push(
          `${where}.${checkpoint.id}.requires: unknown checkpoint '${req}'`
        );
      }
    }
  }

  // A checkpoint can unlock only if every requires chain beneath it ends at
  // a root. A cycle anywhere in those chains strands it forever.
  const requiresOf = new Map(
    pathway.checkpoints.map(c => [c.id, c.requires || []])
  );
  const state = new Map<string, 'visiting' | boolean>();
  const reachesRoot = (id: string): boolean => {
    const known = state.get(id);
    if (known === 'visiting') return false;
    if (known !== undefined) return known;
    state.set(id, 'visiting');
    const requires = requiresOf.get(id);
    const result =
      requires !== undefined &&
      requires.every(r => ids.has(r) && reachesRoot(r));
    state.set(id, result);
    return result;
  };
  for (const checkpoint of pathway.checkpoints) {
    if (unknownRequires.has(checkpoint.id)) continue;
    if (!reachesRoot(checkpoint.id)) {
      problems.push(
        `${where}.${checkpoint.id}: can never unlock; its requires never lead back to a root`
      );
    }
  }

  const stepIds = pathway.checkpoints.flatMap(c => c.steps.map(s => s.id));
  if (new Set(stepIds).size !== stepIds.length) {
    problems.push(`${where}: step ids must be unique across checkpoints`);
  }
  return problems;
}

/**
 * Detects and returns any problems with project-mode lab steps.
 * All project-mode lab steps edit the pathway's single project, so they must
 * use the project's lab and cannot declare start sources; practice steps are
 * self-contained and may use any lab.
 */
function projectStepProblems(pathway: Pathway): string[] {
  const problems: string[] = [];
  const projectLab = pathway.project.lab.type;
  for (const checkpoint of pathway.checkpoints) {
    for (const step of checkpoint.steps) {
      if (step.kind !== 'lab' || step.sourceMode !== 'project') continue;
      const where = `checkpoints.${checkpoint.id}.steps.${step.id}`;
      if (step.lab.type !== projectLab) {
        problems.push(
          `${where}: project step uses '${step.lab.type}' but the pathway's project is '${projectLab}'`
        );
      }
      if (step.lab.startSources) {
        problems.push(
          `${where}: project step cannot declare startSources; the project already has sources`
        );
      }
    }
  }
  return problems;
}
