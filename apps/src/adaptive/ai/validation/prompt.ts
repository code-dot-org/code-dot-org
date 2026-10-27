// The prompt behind the check of a piece of work on a project step, and
// the shape the verdict comes back in. Lab-specific wording comes from
// labEnvironments.

import {z} from 'zod';

import {
  Checkpoint,
  LevelStep,
  Pathway,
  PathwayProjectInfo,
  Skill,
} from '../../types';
import {describeEvidenceLevels} from '../evidenceLevels';
import {labEnvironment} from '../labEnvironments';

import {StepWork} from './types';

/** Bumped when the prompt text changes, so traces say which wording ran. */
export const VALIDATION_PROMPT_VERSION = '2026-10-22';

export const verdictSchema = z.object({
  /** Whether the work meets the step's condition. */
  pass: z.boolean(),
  /** One of the evidence levels the skill describes. */
  evidenceLevel: z.number().int(),
  /** Addressed to the student; at most two sentences. */
  reason: z.string(),
});

export type Verdict = z.infer<typeof verdictSchema>;

export interface ValidationPromptInput {
  pathway: Pathway;
  checkpoint: Checkpoint;
  step: LevelStep;
  /** What the work must show to pass. */
  condition: string;
  /** The skill the work is rated on; its evidence levels are the scale. */
  skill: Skill;
  /** What the student was told to do, as they saw it. */
  instructions: string | undefined;
  project: PathwayProjectInfo;
  work: StepWork;
}

export function buildValidationPrompt({
  pathway,
  checkpoint,
  step,
  condition,
  skill,
  instructions,
  project,
  work,
}: ValidationPromptInput): string {
  const name = project.name ? `"${project.name}"` : 'untitled so far';
  const environment = labEnvironment(pathway);
  return [
    "You check one piece of work in a student's project in a project-based learning pathway. Judge that work: the change below, in light of how the student went about it. The rest of the project is there for context only.",
    environment ? `How the student works in this lab:\n${environment}` : '',
    `Pathway: ${pathway.title}\nObjective: ${pathway.objective}`,
    `Checkpoint: ${checkpoint.title}\n${checkpoint.description}`,
    `Step: ${step.title}${
      instructions ? `\nWhat the student was asked to do:\n${instructions}` : ''
    }`,
    `The student's project is called ${name}.${
      project.description ? `\nThey describe it as: ${project.description}` : ''
    }`,
    work.project
      ? `Their whole project right now:\n${work.project}`
      : 'Their project has no other files.',
    [
      'THE WORK',
      'How it came about:',
      work.process || 'Nothing was recorded.',
      '',
      'What the student changed:',
      work.change || 'Nothing changed.',
    ].join('\n'),
    `CONDITION\n${condition}`,
    describeEvidenceLevels(skill),
    [
      'RULES',
      '',
      '- Judge from the change and how it came about. A condition nothing in the change shows is not met, even if the student may have meant to do it.',
      '- pass is whether the change meets the condition. Be lenient about wording, naming and style, and strict about whether the thing is actually there.',
      '- evidenceLevel is the listed level whose description best matches what the change and how it came about show about the skill; 0 when they show nothing of it.',
      '- reason is addressed to the student in the second person, in plain language at an 8th grade reading level, at most two sentences. When the condition is not met, say what is missing and one concrete thing to do about it. Do not write code for them.',
      '- Return exactly pass, evidenceLevel and reason, and nothing else.',
    ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n');
}
