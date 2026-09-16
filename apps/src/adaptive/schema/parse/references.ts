// Checks the schemas alone cannot make: pathway routing targets, skill
// tree references, checkpoint graphs, skill keys, and whether each
// project-mode lab step fits the pathway's project.

import {z} from 'zod';

import {pathwaySchema} from '../pathway';
import {skillSchema} from '../skill';

type Pathway = z.infer<typeof pathwaySchema>;
type Skill = z.infer<typeof skillSchema>;

/**
 * Detects and returns any reference problems in a pathway.
 */
export function referenceProblems(pathway: Pathway): string[] {
  const problems: string[] = [];
  const stepIds = new Set(pathway.steps.map(s => s.id));
  if (stepIds.size !== pathway.steps.length) {
    problems.push('steps: ids must be unique');
  }
  for (const step of pathway.steps) {
    if (step.next && step.next !== 'end' && !stepIds.has(step.next)) {
      problems.push(`steps.${step.id}.next: unknown step '${step.next}'`);
    }
    if (step.kind === 'lab' && step.sourceMode === 'project') {
      if (step.lab.type !== pathway.project.lab.type) {
        problems.push(
          `steps.${step.id}: project step uses '${step.lab.type}' but the pathway's project is '${pathway.project.lab.type}'`
        );
      }
      if (step.lab.starterFiles) {
        problems.push(
          `steps.${step.id}: project step cannot declare starterFiles; the project already has sources`
        );
      }
    }
  }

  for (const step of pathway.steps) {
    if (step.kind !== 'skillTree') continue;
    for (const ref of step.skills) {
      const skill = pathway.skills[ref.skillId];
      if (!skill) {
        problems.push(
          `steps.${step.id}.skills: unknown skill '${ref.skillId}'`
        );
        continue;
      }
      if (!skill.checkpoints.some(c => c.id === ref.requiredCheckpointId)) {
        problems.push(
          `steps.${step.id}.skills: skill '${ref.skillId}' has no checkpoint '${ref.requiredCheckpointId}'`
        );
      }
    }
  }

  for (const [skillId, skill] of Object.entries(pathway.skills)) {
    if (skill.id !== skillId) {
      problems.push(
        `skills.${skillId}: file id '${skill.id}' does not match key`
      );
    }
    problems.push(...checkpointProblems(skillId, skill));
    problems.push(...projectStepProblems(skillId, skill, pathway));
  }

  return problems;
}

/**
 * Detects and returns any problems with the checkpoint graph in a skill.
 */
function checkpointProblems(skillId: string, skill: Skill): string[] {
  const where = `skills.${skillId}.checkpoints`;
  const problems: string[] = [];
  const ids = new Set(skill.checkpoints.map(c => c.id));
  if (ids.size !== skill.checkpoints.length) {
    problems.push(`${where}: ids must be unique`);
  }
  if (!skill.checkpoints.some(c => !c.requires?.length)) {
    problems.push(`${where}: no entry point (every checkpoint has requires)`);
  }
  for (const checkpoint of skill.checkpoints) {
    for (const req of checkpoint.requires || []) {
      if (!ids.has(req)) {
        problems.push(
          `${where}.${checkpoint.id}.requires: unknown checkpoint '${req}'`
        );
      }
    }
  }

  // Cycle check over the requires graph.
  const requiresOf = new Map(
    skill.checkpoints.map(c => [
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
  if (skill.checkpoints.some(c => visit(c.id))) {
    problems.push(`${where}: requires must not form a cycle`);
  }

  const stepIds = skill.checkpoints.flatMap(c => c.steps.map(s => s.id));
  if (new Set(stepIds).size !== stepIds.length) {
    problems.push(
      `skills.${skillId}: step ids must be unique across checkpoints`
    );
  }
  return problems;
}

/**
 * Detects and returns any problems with project-mode lab steps in a skill.
 * All project-mode lab steps edit the pathway's single project, so they must
 * use the project's lab and cannot declare starter files; practice steps are
 * self-contained and may use any lab.
 */
function projectStepProblems(
  skillId: string,
  skill: Skill,
  pathway: Pathway
): string[] {
  const problems: string[] = [];
  const projectLab = pathway.project.lab.type;
  for (const checkpoint of skill.checkpoints) {
    for (const step of checkpoint.steps) {
      if (step.kind !== 'lab' || step.sourceMode !== 'project') continue;
      const where = `skills.${skillId}.checkpoints.${checkpoint.id}.steps.${step.id}`;
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
