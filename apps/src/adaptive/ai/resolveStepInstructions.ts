// What a level step shows as its instructions: the authored text, or for a
// project step with a prompt, text generated around the student's project
// and cached in progress by a hash of what it was made from. Generation
// failing, adaptive AI being off, or generated text that does not clear
// moderation means the authored text.

import {AichatContext} from '@cdo/apps/aichat/types';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {
  moderationFallbackReason,
  sendAdaptiveEvent,
  sendAiStaticFallbackUsed,
  stepProperties,
} from '../metricsHelpers';
import {GeneratedContent, generateInputsHash} from '../progress/model';
import {summarizeProjectFiles} from '../project/summarizeProjectFiles';
import {Checkpoint, LevelStep, Pathway, PathwayProjectInfo} from '../types';

import {generate, moderateOutput} from './generate';
import {
  INSTRUCTIONS_PROMPT_VERSION,
  buildInstructionsPrompt,
  generatedInstructionsSchema,
} from './instructionsPrompt';
import {ADAPTIVE_MODELS} from './models';

// Saving fresh instructions reruns the caller's effect, which then hits the
// cache; that hit is the same generation, so it is not reported again.
let justGeneratedHash: string | undefined;

export interface StepInstructionsOptions {
  pathway: Pathway;
  checkpoint: Checkpoint;
  step: LevelStep;
  projectInfo: PathwayProjectInfo;
  /** Undefined while the project is still loading; nothing is generated until it arrives. */
  sources: ProjectSources | undefined;
  /** The step's own instructions, else the level's. */
  authoredInstructions: string | undefined;
  /** Saved instructions, reused while their inputsHash still matches. */
  generatedInstructions: GeneratedContent | undefined;
  saveGeneratedInstructions: (
    stepId: string,
    content: GeneratedContent
  ) => void;
  /** The shell's own context, not the mounted chat's. */
  aichatContext: AichatContext;
}

/**
 * Resolves instructions for a step. For non-project steps, this is just
 * the authored instructions. If a project step has an instructionsPrompt,
 * we generate instructions based on the student's project and pathway context.
 */
export async function resolveStepInstructions({
  pathway,
  checkpoint,
  step,
  projectInfo,
  sources,
  authoredInstructions,
  generatedInstructions,
  saveGeneratedInstructions,
  aichatContext,
}: StepInstructionsOptions): Promise<string | undefined> {
  if (!step.instructionsPrompt || !step.project) return authoredInstructions;
  if (sources === undefined) return authoredInstructions;

  const prompt = buildInstructionsPrompt({
    pathway,
    checkpoint,
    step,
    project: {...projectInfo, sourceCode: summarizeProjectFiles(sources)},
    fallback: authoredInstructions,
  });
  const inputsHash = generateInputsHash(prompt);
  const sendGenerated = (result: {
    cacheHit: boolean;
    success: boolean;
    latencyMs?: number;
  }) =>
    sendAdaptiveEvent(EVENTS.ADAPTIVE_INSTRUCTIONS_GENERATED, {
      ...stepProperties(checkpoint, step),
      ...result,
    });
  if (generatedInstructions?.inputsHash === inputsHash) {
    if (justGeneratedHash === inputsHash) justGeneratedHash = undefined;
    else sendGenerated({cacheHit: true, success: true});
    return generatedInstructions.instructions;
  }

  const startedAt = Date.now();
  const {output, traceId} = await generate({
    schema: generatedInstructionsSchema,
    model: ADAPTIVE_MODELS.FAST,
    prompt,
    context: aichatContext,
    trace: {
      name: 'adaptive-instructions',
      metadata: {
        pathwayId: pathway.id,
        checkpointId: checkpoint.id,
        stepId: step.id,
        inputsHash,
        promptVersion: INSTRUCTIONS_PROMPT_VERSION,
      },
    },
  });
  sendGenerated({
    cacheHit: false,
    success: !!output,
    latencyMs: Date.now() - startedAt,
  });
  if (!output) {
    sendAiStaticFallbackUsed(
      'instructions',
      'modelErrorOrInvalidOutput',
      checkpoint,
      step
    );
    return authoredInstructions;
  }
  // Nothing is cached, so the next resolve asks again rather than keep text
  // the judge would not clear.
  const moderation = await moderateOutput(output.instructions, aichatContext);
  if (moderation !== 'ok') {
    Lab2Registry.getInstance().getMetricsReporter().logWarning({
      message:
        'Adaptive instructions not shown: generated text did not clear moderation',
      moderation,
      pathwayId: pathway.id,
      stepId: step.id,
      traceId,
    });
    sendAiStaticFallbackUsed(
      'instructions',
      moderationFallbackReason(moderation),
      checkpoint,
      step
    );
    return authoredInstructions;
  }
  justGeneratedHash = inputsHash;
  saveGeneratedInstructions(step.id, {
    instructions: output.instructions,
    inputsHash,
    traceId,
  });
  return output.instructions;
}
