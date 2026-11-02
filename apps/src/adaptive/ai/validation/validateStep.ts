// Judges one piece of work on a project step against the step's condition
// and the skill it measures, and shapes the verdict as the attempt progress
// keeps. A judge that cannot answer records nothing.

import {AichatContext} from '@cdo/apps/aichat/types';

import {ValidationAttempt} from '../../progress/model';
import {Checkpoint, LevelStep, Pathway, PathwayProjectInfo} from '../../types';
import {generate, isAdaptiveAiEnabled} from '../generate';

import {
  OPENERS,
  VALIDATION_PROMPT_VERSION,
  buildValidationPrompt,
  verdictSchema,
} from './prompt';
import {StepWork} from './types';

export interface ValidateStepOptions {
  pathway: Pathway;
  checkpoint: Checkpoint;
  step: LevelStep;
  projectInfo: PathwayProjectInfo;
  /** The instructions the student saw, generated or authored. */
  instructions: string | undefined;
  work: StepWork;
  /** The shell's own context, not the mounted chat's. */
  aichatContext: AichatContext;
  /** Called once the judge is about to run, so the caller can say so. */
  onJudging?: () => void;
}

/**
 * The attempt judging the work, or undefined when there is nothing to
 * record: the step has no validation block, the measured skill describes
 * no evidence levels, adaptive AI is off, or the judge failed. The caller
 * records the attempt and tells the student.
 */
export async function validateStep({
  pathway,
  checkpoint,
  step,
  projectInfo,
  instructions,
  work,
  aichatContext,
  onJudging,
}: ValidateStepOptions): Promise<Omit<ValidationAttempt, 'at'> | undefined> {
  const {validation} = step;
  if (!validation) return undefined;
  const skill = pathway.skills[validation.measures.skillId];
  const described = skill?.evidenceLevels;
  if (!skill || !described) return undefined;
  if (!isAdaptiveAiEnabled()) return undefined;
  onJudging?.();

  const prompt = buildValidationPrompt({
    pathway,
    checkpoint,
    step,
    condition: validation.condition,
    skill,
    instructions,
    project: projectInfo,
    work,
  });
  const {output, traceId} = await generate({
    schema: verdictSchema,
    prompt,
    context: aichatContext,
    trace: {
      name: 'adaptive-validation',
      metadata: {
        pathwayId: pathway.id,
        checkpointId: checkpoint.id,
        stepId: step.id,
        workAt: work.at,
        promptVersion: VALIDATION_PROMPT_VERSION,
      },
    },
  });
  if (!output) return undefined;
  return {
    pass: output.pass,
    evidenceLevel: describedLevelAtOrBelow(described, output.evidenceLevel),
    reason: withOpener(output.pass, output.reason),
    traceId,
  };
}

/**
 * The reason opening with a word that fits the verdict: the judge's own
 * when it chose one that fits, else the default for the verdict in place
 * of whatever it chose.
 */
export function withOpener(pass: boolean, reason: string): string {
  const allowed: readonly string[] = pass ? OPENERS.pass : OPENERS.fail;
  const text = reason.trim();
  if (allowed.some(opener => text.startsWith(opener))) return text;
  const known = [...OPENERS.pass, ...OPENERS.fail].find(opener =>
    text.startsWith(opener)
  );
  const rest = known ? text.slice(known.length).trim() : text;
  return rest ? `${allowed[0]} ${rest}` : allowed[0];
}

/** The highest evidence level the skill describes at or below `level`, else 0. */
function describedLevelAtOrBelow(
  described: {[level: string]: string},
  level: number
): number {
  return Object.keys(described)
    .map(Number)
    .filter(l => l <= level)
    .reduce((best, l) => Math.max(best, l), 0);
}
