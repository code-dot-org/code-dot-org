// The prompt behind generated step instructions, and the shape it must
// come back in. Lab-specific wording comes from labEnvironments, not from here.

import {codeBlock} from '@codebridge/utils/codeBlock';
import {z} from 'zod';

import {Checkpoint, LevelStep, Pathway, PathwayProjectInfo} from '../types';

import {describeEvidenceLevels} from './evidenceLevels';
import {labEnvironment} from './labEnvironments';

/**
 * Used by Langfuse traces; change when a meaningful update is made.
 */
export const INSTRUCTIONS_PROMPT_VERSION = '2026-11-12';

export const generatedInstructionsSchema = z.object({
  /** Markdown the student reads, in place of the authored instructions. */
  instructions: z.string().min(1),
});

export type GeneratedInstructions = z.infer<typeof generatedInstructionsSchema>;

export interface InstructionsPromptInput {
  pathway: Pathway;
  checkpoint: Checkpoint;
  step: LevelStep;
  project: PathwayProjectInfo & {sourceCode: string};
  /** The authored instructions, whose objective, tone and length the result keeps. */
  fallback?: string;
}

export function buildInstructionsPrompt({
  pathway,
  checkpoint,
  step,
  project,
  fallback,
}: InstructionsPromptInput): string {
  const name = project.name ? `"${project.name}"` : 'untitled so far';
  const environment = labEnvironment(pathway);
  const {validation} = step;
  const skill = validation && pathway.skills[validation.measures.skillId];
  const levels = skill ? describeEvidenceLevels(skill) : '';
  return [
    'You write the instructions a student reads for one step of a project-based learning pathway. The student is building their own project in a coding lab, and these instructions tell them what to do next in it.',
    environment ? `How the student works in this lab:\n${environment}` : '',
    `Pathway: ${pathway.title}\nObjective: ${pathway.objective}`,
    `Checkpoint: ${checkpoint.title}\n${checkpoint.description}`,
    `Step: ${step.title}\nWhat this step should get the student to do:\n${step.instructionsPrompt}`,
    `The student's project is called ${name}.${
      project.description ? `\nThey describe it as: ${project.description}` : ''
    }`,
    project.sourceCode
      ? `Their project files right now:\n${project.sourceCode}`
      : 'Their project has no files yet.',
    fallback
      ? [
          'TEMPLATE. These are the authored instructions for this step, written for any student. Base yours on them: keep the same structure (including any heading such as "Do This:"), markdown formatting, tone and objective, and change only the content so it fits this student\'s project.',
          codeBlock(fallback),
        ].join('\n')
      : '',
    validation
      ? [
          'HOW THE WORK IS CHECKED',
          'When the student finishes, the change they made in this step is checked against this condition:',
          validation.condition,
          levels,
        ]
          .filter(Boolean)
          .join('\n')
      : '',
    [
      'Write the instructions for this student. The goal is for them to actually read and act on the box, so it must be scannable, action-first, and concrete.',
      '',
      '- If the template has a heading, start with that same heading on its own line.',
      validation
        ? '- The steps must ask for exactly what the condition names, in terms of their project, so work that follows them meets it. Do not mention the check or quote the condition.'
        : '',
      levels ? '- Ask for work at the highest evidence level listed.' : '',
      '- An opening acknowledgement is fine if it is short and part of a sentence that leads into the first step, such as "Your header looks great! Now add...". No separate recap of what the page already has.',
      '- Name their actual project content (title, description, page text) where it shows them what to do.',
      '- Stay within what the step asks for; do not add goals.',
      '- Second person, markdown, plain language at an 8th grade reading level.',
      '',
      'FORMAT RULES',
      '',
      '1. One step per prompt the student must write.',
      '   - If the task involves two separate prompts, write two steps.',
      '   - Each step contains exactly one action. Do not combine actions in a single step or bury a second task in a sub-clause.',
      '   - No more than three steps, ideally one or two.',
      '   - Number the steps only when there are two or more. A single step goes unnumbered on the line after the heading.',
      '',
      '2. Bold the action verb phrase in each step.',
      '   - Bold only the core task (for example, "change the font" or "add one short sentence"), not the whole sentence.',
      '   - Bold nothing else in the steps, so the bolding stays meaningful on a skim.',
      '   - Start each step with a verb, and keep each step to one short line.',
      '',
      '3. Keep it short.',
      '   - The whole box, heading included, is 50 words at most; aim for 40.',
      '   - Put the first action at the top. Put rationale or background after the steps, or leave it out.',
      '',
      'EXAMPLE OUTPUT FORMAT, two steps',
      '',
      '**Do This:**',
      '1. [Verb] **[bolded action]** [object and location].',
      '2. [Verb] **[bolded action]** [object and location].',
      '',
      'EXAMPLE OUTPUT FORMAT, one step',
      '',
      '**Do This:**',
      '[Verb] **[bolded action]** [object and location].',
      '',
      'Return only the formatted box, with no preamble or commentary.',
    ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n');
}
