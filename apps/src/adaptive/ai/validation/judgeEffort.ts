// Rates one checked step's chat for genuine effort. A judge that cannot
// answer gives nothing. The judge's own reason stays in the trace; the
// student is told only when Continue opens.

import {AichatContext} from '@cdo/apps/aichat/types';

import {sendAiStaticFallbackUsed} from '../../metricsHelpers';
import {Checkpoint, LevelStep, Pathway} from '../../types';
import {generate, isAdaptiveAiEnabled} from '../generate';
import {ADAPTIVE_MODELS} from '../models';

import {
  EFFORT_PROMPT_VERSION,
  buildEffortPrompt,
  effortVerdictSchema,
} from './effortPrompt';

/** The judge's answer: whether the student is genuinely trying. */
export interface EffortJudgement {
  pass: boolean;
  /** The Langfuse trace the judge ran under. */
  traceId?: string;
}

export interface JudgeEffortOptions {
  pathway: Pathway;
  checkpoint: Checkpoint;
  step: LevelStep;
  /** The instructions the student saw, generated or authored. */
  instructions: string | undefined;
  /** The chat so far, one line each. */
  transcript: string;
  /** Replies in the chat so far. */
  replies: number;
  /** The shell's own context, not the mounted chat's. */
  aichatContext: AichatContext;
}

/**
 * The judgement of the chat, or undefined when there is none: the step has
 * no validation block, adaptive AI is off, or the judge failed.
 */
export async function judgeEffort({
  pathway,
  checkpoint,
  step,
  instructions,
  transcript,
  replies,
  aichatContext,
}: JudgeEffortOptions): Promise<EffortJudgement | undefined> {
  const {validation} = step;
  if (!validation) return undefined;
  if (!isAdaptiveAiEnabled()) return undefined;

  const prompt = buildEffortPrompt({
    pathway,
    checkpoint,
    step,
    condition: validation.condition,
    instructions,
    transcript,
  });
  const {output, traceId} = await generate({
    schema: effortVerdictSchema,
    model: ADAPTIVE_MODELS.FAST,
    prompt,
    context: aichatContext,
    trace: {
      name: 'adaptive-effort',
      metadata: {
        pathwayId: pathway.id,
        checkpointId: checkpoint.id,
        stepId: step.id,
        replies,
        promptVersion: EFFORT_PROMPT_VERSION,
      },
    },
  });
  if (!output) {
    sendAiStaticFallbackUsed(
      'effort',
      'modelErrorOrInvalidOutput',
      checkpoint,
      step
    );
    return undefined;
  }
  return {pass: output.sufficient, traceId};
}
