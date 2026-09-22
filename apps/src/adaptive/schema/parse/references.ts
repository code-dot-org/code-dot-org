// Checks the schemas alone cannot make: checkpoint graph shape, skill
// references, and whether each project-mode lab step fits the pathway's
// project.

import {z} from 'zod';

import {pathwaySchema} from '../pathway';

type Pathway = z.infer<typeof pathwaySchema>;

/**
 * Detects and returns any reference problems in a pathway.
 */
export function referenceProblems(pathway: Pathway): string[] {
  const problems: string[] = [];
  for (const [skillId, skill] of Object.entries(pathway.skills)) {
    if (skill.id !== skillId) {
      problems.push(`skills.${skillId}: id '${skill.id}' does not match key`);
    }
  }
  problems.push(...checkpointProblems(pathway));
  problems.push(...projectStepProblems(pathway));
  return problems;
}

/**
 * Detects and returns any problems with the checkpoint graph.
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
  for (const checkpoint of pathway.checkpoints) {
    for (const req of checkpoint.requires || []) {
      if (!ids.has(req)) {
        problems.push(
          `${where}.${checkpoint.id}.requires: unknown checkpoint '${req}'`
        );
      }
    }
    for (const skillId of checkpoint.skillIds || []) {
      if (!pathway.skills[skillId]) {
        problems.push(
          `${where}.${checkpoint.id}.skillIds: unknown skill '${skillId}'`
        );
      }
    }
  }

  // Cycle check over the requires graph.
  const requiresOf = new Map(
    pathway.checkpoints.map(c => [
      c.id,
      (c.requires || []).filter(r => ids.has(r)),
    ])
  );
  const state = new Map<string, 'visiting' | 'done'>();
  const visit = (id: string): boolean => {
    if (state.get(id) === 'done') return false;
    if (state.get(id) === 'visiting') return true;
    state.set(id, 'visiting');
    const cyclic = (requiresOf.get(id) || []).some(visit);
    state.set(id, 'done');
    return cyclic;
  };
  if (pathway.checkpoints.some(c => visit(c.id))) {
    problems.push(`${where}: requires must not form a cycle`);
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
 * use the project's lab and cannot declare starter files; practice steps are
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
      if (step.lab.starterFiles) {
        problems.push(
          `${where}: project step cannot declare starterFiles; the project already has sources`
        );
      }
    }
  }
  return problems;
}
