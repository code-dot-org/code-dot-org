// The prompt behind a generated project, the template rewritten around what
// the student said they want to make, and the shape it must come back in.

import {codeBlock} from '@codebridge/utils/codeBlock';
import {z} from 'zod';

import {ProjectFile} from '@cdo/apps/lab2/types';

import {CheckpointPlan} from '../project/plan';
import {Checkpoint, LevelStep, Pathway} from '../types';

import {labEnvironment} from './labEnvironments';

/**
 * Used by Langfuse traces; change when a meaningful update is made.
 */
export const PROJECT_PROMPT_VERSION = '2026-10-29';

export const projectOutputSchema = z.object({
  /** The project's name, a few words. */
  name: z.string().min(1).max(60),
  /** One sentence on what the project is, for the project card. */
  description: z.string().min(1).max(300),
  /** Template files rewritten in full. A file left out stays as authored. */
  files: z
    .array(z.object({name: z.string().min(1), contents: z.string()}))
    .min(1),
});

export type ProjectOutput = z.infer<typeof projectOutputSchema>;

export interface ProjectPromptInput {
  pathway: Pathway;
  checkpoint: Checkpoint;
  step: LevelStep;
  /** The checkpoint's plan: the answers, and the sentence they fill once complete. */
  plan: CheckpointPlan;
  /** The template's editable files, the only ones the model may rewrite. */
  files: ProjectFile[];
}

export function buildProjectPrompt({
  pathway,
  checkpoint,
  step,
  plan,
  files,
}: ProjectPromptInput): string {
  const environment = labEnvironment(pathway);
  return [
    "You build the first version of a student's project in a project-based learning pathway. The student has said what they want to make; turn that into a working starting point they will keep building on, by rewriting the template files below.",
    environment ? `How the student works in this lab:\n${environment}` : '',
    `Pathway: ${pathway.title}\nObjective: ${pathway.objective}`,
    `Checkpoint: ${checkpoint.title}\n${checkpoint.description}`,
    `Step: ${step.title}\nWhat the first version should be:\n${step.projectPrompt}`,
    plan.sentence
      ? `The student's plan, as they saw it before asking for this build:\n${plan.sentence}`
      : '',
    [
      'What the student said, in their own words:',
      ...plan.answers.map(
        ({question, answer}) => `Q: ${question}\nA: ${answer}`
      ),
    ].join('\n\n'),
    [
      'TEMPLATE FILES. These are the only files, and the only ones that may be rewritten:',
      ...files.map(
        file => `filename: ${file.name}\n${codeBlock(file.contents)}`
      ),
    ].join('\n\n'),
    [
      'RULES',
      '',
      '- Return the full contents of every file you change, under its exact filename. Do not add files; a file you leave out stays as it is.',
      "- Keep the template's structure, ids and classes where they still fit, so later instructions about the template's parts still apply.",
      '- Stay close to the idea the student described: their topic, words and names. Where they left the look or content open, make a reasonable choice that fits the topic, and label any placeholder text plainly.',
      '- Keep it simple. This is a first draft the student will change, not a finished site.',
      '- Plain language at an 8th grade reading level. No personal information, profanity or unsafe content.',
      "- name: the project's name in at most five words, taken from or fitting the student's answers.",
      '- description: one sentence saying what the project is and who it is for.',
    ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n');
}
