// Checks the schemas alone cannot make: skill references, checkpoint graph
// shape, question and choice ids, each level played by at most one step, and whether
// each level step's `project` flag agrees with the level the server resolved
// for it.

import {z} from 'zod';

import {pathwaySchema, pathwaySourceSchema} from '../pathway';

// A source has no resolved levels, so its project flags go unchecked.
type Pathway =
  | z.infer<typeof pathwaySchema>
  | z.infer<typeof pathwaySourceSchema>;

/**
 * Detects and returns any reference problems in a pathway.
 */
export function findReferenceProblems(pathway: Pathway): string[] {
  return [
    ...findSkillProblems(pathway),
    ...findCheckpointProblems(pathway),
    ...findQuestionProblems(pathway),
    ...findLevelReuseProblems(pathway),
    ...findLevelStepProblems(pathway),
  ];
}

/**
 * Detects question ids used more than once, and multiple choice questions
 * whose choice ids repeat or whose correct choice is not among them.
 */
function findQuestionProblems(pathway: Pathway): string[] {
  const problems: string[] = [];
  const seen = new Set<string | number>();
  const duplicates = new Set<string | number>();
  for (const checkpoint of pathway.checkpoints) {
    for (const step of checkpoint.steps) {
      if (step.kind !== 'questions') continue;
      step.questions.forEach((question, index) => {
        if (seen.has(question.id)) duplicates.add(question.id);
        seen.add(question.id);

        if (question.type !== 'MultipleChoiceQuestion') return;
        const where = `checkpoints.${checkpoint.id}.steps.${step.id}.questions.${index}`;
        const choiceIds = new Set<string>();
        const repeated = new Set<string>();
        for (const {id} of question.choices) {
          if (choiceIds.has(id)) repeated.add(id);
          choiceIds.add(id);
        }
        for (const id of repeated) {
          problems.push(`${where}: choice id '${id}' is used more than once`);
        }
        const {correctChoiceId} = question;
        if (correctChoiceId !== undefined && !choiceIds.has(correctChoiceId)) {
          problems.push(
            `${where}.correctChoiceId: '${correctChoiceId}' is not one of its choices`
          );
        }
      });
    }
  }
  return [
    ...[...duplicates].map(
      id => `checkpoints: question id '${id}' is used more than once`
    ),
    ...problems,
  ];
}

/**
 * Detects a level played by more than one step, or by a step and the project
 * view: level steps must be unique and must not name the project template.
 */
function findLevelReuseProblems(pathway: Pathway): string[] {
  const problems: string[] = [];
  const template = pathway.project.templateLevel;
  const firstUse = new Map<string, string>();
  for (const checkpoint of pathway.checkpoints) {
    for (const step of checkpoint.steps) {
      if (step.kind !== 'level') continue;
      const where = `checkpoints.${checkpoint.id}.steps.${step.id}`;
      if (step.level === template) {
        problems.push(
          `${where}: level '${step.level}' is the project template level, which only the project view plays`
        );
      }
      const earlier = firstUse.get(step.level);
      if (earlier) {
        problems.push(
          `${where}: level '${step.level}' is already played by ${earlier}`
        );
      } else {
        firstUse.set(step.level, where);
      }
    }
  }
  return problems;
}

/**
 * Detects level steps whose `project` flag disagrees with their level: a
 * project step's level must share the pathway's project template, and a
 * sandbox step's must not (skipped when the level did not resolve), and
 * sandbox steps that ask for generated instructions.
 */
function findLevelStepProblems(pathway: Pathway): string[] {
  const problems: string[] = [];
  const template = pathway.project.templateLevel;
  for (const checkpoint of pathway.checkpoints) {
    for (const step of checkpoint.steps) {
      if (step.kind !== 'level') continue;
      const where = `checkpoints.${checkpoint.id}.steps.${step.id}`;
      if (step.instructionsPrompt && !step.project) {
        problems.push(
          `${where}: instructionsPrompt needs the student's project, so the step must be marked project`
        );
      }
      if (!('levelProperties' in step) || !step.levelProperties) continue;
      const sharesProject =
        step.level === template ||
        step.levelProperties.projectTemplateLevelName === template;
      if (step.project && !sharesProject) {
        problems.push(
          `${where}: marked project but level '${step.level}' does not use template '${template}'`
        );
      } else if (!step.project && sharesProject) {
        problems.push(
          `${where}: level '${step.level}' uses the project template but the step is not marked project`
        );
      }
    }
  }
  return problems;
}

/**
 * Detects and returns any problems with skills: map keys must match ids and
 * checkpoints may only reference skills in the map.
 */
function findSkillProblems(pathway: Pathway): string[] {
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
function findCheckpointProblems(pathway: Pathway): string[] {
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
