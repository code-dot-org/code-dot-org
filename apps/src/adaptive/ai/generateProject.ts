// A generated project: the template rewritten around the student's answers
// by one model call, laid over the template's sources. No answers, no
// editable files, adaptive AI off, a failed call or answers that do not
// clear moderation all mean nothing is generated, and the template stands.

import * as Observability from '@code-dot-org/core/plugins/observability';

import {AichatContext} from '@cdo/apps/aichat/types';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectSources} from '@cdo/apps/lab2/types';

import {Progress} from '../progress/model';
import {
  applyGeneratedFiles,
  freeResponseAnswers,
  editableFiles,
} from '../project/projectGeneration';
import {Checkpoint, LevelStep, Pathway, PathwayProjectInfo} from '../types';

import {generate, isAdaptiveAiEnabled, moderateInput} from './generate';
import {
  PROJECT_PROMPT_VERSION,
  buildProjectPrompt,
  projectOutputSchema,
} from './projectPrompt';

export interface GenerateProjectOptions {
  pathway: Pathway;
  checkpoint: Checkpoint;
  step: LevelStep;
  progress: Progress;
  projectInfo: PathwayProjectInfo;
  /** The project as it stands, which is the template when nothing is saved. */
  sources: ProjectSources;
  /** The shell's own context, not the mounted chat's. */
  aichatContext: AichatContext;
}

export interface GeneratedProject {
  name: string;
  description: string;
  sources: ProjectSources;
  /** The Langfuse trace it was built under. */
  traceId: string;
}

/**
 * Builds the project a project step asks for. A name or description the
 * student already gave stays theirs; the model's fills whichever is missing.
 * The student's answers are moderated first; the model is never asked about
 * answers that did not clear.
 */
export async function generateProject({
  pathway,
  checkpoint,
  step,
  progress,
  projectInfo,
  sources,
  aichatContext,
}: GenerateProjectOptions): Promise<GeneratedProject | undefined> {
  if (!step.projectPrompt || !step.project) return undefined;
  if (!isAdaptiveAiEnabled()) return undefined;
  const answers = freeResponseAnswers(pathway, progress);
  const files = editableFiles(sources);
  if (answers.length === 0 || files.length === 0) return undefined;

  const prompt = buildProjectPrompt({
    pathway,
    checkpoint,
    step,
    answers,
    project: projectInfo,
    files,
  });
  const moderation = await moderateInput(
    answers.map(({answer}) => answer).join('\n\n'),
    aichatContext
  );
  Observability.metrics.count('adaptive.text_moderation', 1, {
    phase: 'input_filter',
    result: moderation,
  });
  if (moderation !== 'ok') {
    Lab2Registry.getInstance().getMetricsReporter().logWarning({
      message:
        'Adaptive project not generated: answers did not clear moderation',
      moderation,
      pathwayId: pathway.id,
      stepId: step.id,
    });
    return undefined;
  }

  const {output, traceId} = await generate({
    schema: projectOutputSchema,
    prompt,
    context: aichatContext,
    trace: {
      name: 'adaptive-project',
      metadata: {
        pathwayId: pathway.id,
        checkpointId: checkpoint.id,
        stepId: step.id,
        promptVersion: PROJECT_PROMPT_VERSION,
      },
    },
  });
  if (!output || !traceId) return undefined;
  const seeded = applyGeneratedFiles(sources, output.files);
  if (!seeded) return undefined;
  return {
    name: projectInfo.name ?? output.name,
    description: projectInfo.description ?? output.description,
    sources: seeded,
    traceId,
  };
}
