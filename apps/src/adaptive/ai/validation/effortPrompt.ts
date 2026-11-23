// The prompt behind the look at a student's chat on a checked step, and the
// shape its verdict comes back in. The transcript is the only evidence: no
// build has passed, or the step would already be open.

import {z} from 'zod';

import {Checkpoint, LevelStep, Pathway} from '../../types';
import {labEnvironment} from '../labEnvironments';

/** Bumped when the prompt text changes, so traces say which wording ran. */
export const EFFORT_PROMPT_VERSION = '2026-11-16';

export const effortVerdictSchema = z.object({
  /** Whether the student is genuinely trying to understand and do the step. */
  sufficient: z.boolean(),
  /** One or two sentences for the record, never shown to the student. */
  reason: z.string(),
});

export type EffortVerdict = z.infer<typeof effortVerdictSchema>;

export interface EffortPromptInput {
  pathway: Pathway;
  checkpoint: Checkpoint;
  step: LevelStep;
  /** What the work must show to pass. */
  condition: string;
  /** What the student was told to do, as they saw it. */
  instructions: string | undefined;
  /** The chat so far, one line each. */
  transcript: string;
}

export function buildEffortPrompt({
  pathway,
  checkpoint,
  step,
  condition,
  instructions,
  transcript,
}: EffortPromptInput): string {
  const environment = labEnvironment(pathway);
  return [
    "You read a student's chat with an AI build partner on one step of a project-based learning pathway. The step's goal has not been met yet. Decide whether the student is genuinely trying to understand the step and get there, so they can be let through without meeting it.",
    environment ? `How the student works in this lab:\n${environment}` : '',
    `Pathway: ${pathway.title}\nObjective: ${pathway.objective}`,
    `Checkpoint: ${checkpoint.title}\n${checkpoint.description}`,
    `Step: ${step.title}${
      instructions ? `\nWhat the student was asked to do:\n${instructions}` : ''
    }`,
    `GOAL\n${condition}`,
    `THE CHAT\n${transcript || 'Nothing was said.'}`,
    [
      'RULES',
      '',
      '- sufficient is true when the chat shows the student working toward the goal: asking about it, asking for builds that relate to it, reacting to what came back, or saying what is confusing them. It stays true if they are struggling or asking imperfect questions, as long as the effort is real.',
      '- sufficient is false when the chat is off topic, is the same request repeated without change, is only greetings or one-word messages, or shows no attempt to engage with the step.',
      '- reason is one or two sentences saying what in the chat decided it. It is a note for the record, not a message to the student.',
      '- Return exactly sufficient and reason, and nothing else.',
    ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n');
}
