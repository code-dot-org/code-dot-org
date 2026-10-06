// The prompt behind generated step instructions, and the shape it must
// come back in. Lab-specific wording comes from labEnvironments, not from here.

import {codeBlock} from '@codebridge/utils/codeBlock';
import {z} from 'zod';

import {Checkpoint, LevelStep, Pathway, PathwayProjectInfo} from '../types';

import {labEnvironment} from './labEnvironments';

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
    [
      'Write the instructions for this student:',
      '- One clear objective in one or two sentences, 40 words at most, not counting a heading carried over from the template. Second person, markdown.',
      '- If the template has a heading, start with that same heading on its own line, then the instruction.',
      '- An opening acknowledgement is fine if it is short and part of a sentence that leads into the instruction, such as "Your header looks great! Now add...". No separate recap of what the page already has.',
      '- Name their actual project content (title, description, page text) where it shows them what to do.',
      '- Stay within what the step asks for; do not add goals.',
    ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n');
}
