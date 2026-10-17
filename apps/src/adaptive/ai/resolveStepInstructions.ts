// What a level step shows as its instructions: the authored text, or for a
// project step with a prompt, text generated around the student's project
// and cached in progress by a hash of what it was made from. Generation
// failing, or adaptive AI being off, means the authored text.

import {AichatContext} from '@cdo/apps/aichat/types';
import {ProjectSources} from '@cdo/apps/lab2/types';

import {
  GeneratedContent,
  StepContext,
  generateInputsHash,
} from '../progress/model';
import {summarizeProjectFiles} from '../project/summarizeProjectFiles';
import {Checkpoint, LevelStep, Pathway, PathwayProjectInfo} from '../types';

import {generate} from './generate';
import {
  INSTRUCTIONS_PROMPT_VERSION,
  buildInstructionsPrompt,
  generatedInstructionsSchema,
} from './instructionsPrompt';

export interface StepInstructionsOptions {
  pathway: Pathway;
  checkpoint: Checkpoint;
  step: LevelStep;
  projectInfo: PathwayProjectInfo;
  /** Undefined while the project is still loading; nothing is generated until it arrives. */
  sources: ProjectSources | undefined;
  /** The step's own instructions, else the level's. */
  authoredInstructions: string | undefined;
  stepContext: StepContext | undefined;
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
  stepContext,
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
  if (stepContext?.generated?.inputsHash === inputsHash) {
    return stepContext.generated.instructions;
  }

  const {output, traceId} = await generate({
    schema: generatedInstructionsSchema,
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
  if (!output) return authoredInstructions;
  saveGeneratedInstructions(step.id, {
    instructions: output.instructions,
    inputsHash,
    traceId,
  });
  return output.instructions;
}
