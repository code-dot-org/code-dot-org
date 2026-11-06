// A generated project: the template rewritten around the student's answers
// by one model call, laid over the template's sources. No answers, no
// editable files, adaptive AI off, a failed call, answers that do not clear
// moderation or a result that does not all mean nothing is generated, and
// the template stands.

import {AichatContext} from '@cdo/apps/aichat/types';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectSources} from '@cdo/apps/lab2/types';

import {Progress} from '../progress/model';
import {checkpointPlan} from '../project/plan';
import {applyGeneratedFiles, editableFiles} from '../project/projectGeneration';
import {Checkpoint, LevelStep, Pathway} from '../types';

import {
  generate,
  isAdaptiveAiEnabled,
  moderateInput,
  moderateOutput,
} from './generate';
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
  /** What the project is built over: the template, so a rebuild starts clean. */
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
 * Builds the project a project step asks for, named and described by the
 * model from the same call. What the student typed is moderated first; the
 * model is never asked about answers that did not clear. What the model
 * wrote is moderated too, as the student's site and its name, before any
 * of it is laid over the template.
 */
export async function generateProject({
  pathway,
  checkpoint,
  step,
  progress,
  sources,
  aichatContext,
}: GenerateProjectOptions): Promise<GeneratedProject | undefined> {
  if (!step.projectPrompt || !step.project) return undefined;
  if (!isAdaptiveAiEnabled()) return undefined;
  const plan = checkpointPlan(checkpoint, progress);
  const files = editableFiles(sources);
  if (plan.answers.length === 0 || files.length === 0) return undefined;

  const prompt = buildProjectPrompt({
    pathway,
    checkpoint,
    step,
    plan,
    files,
  });
  // Only what the student wrote is moderated; a chosen answer is authored text.
  const typed = plan.answers.filter(a => a.typed).map(a => a.answer);
  const moderation = typed.length
    ? await moderateInput(typed.join('\n\n'), aichatContext)
    : 'ok';
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
  const written = [
    output.name,
    output.description,
    ...output.files.map(file => file.contents),
  ].join('\n\n');
  const outputModeration = await moderateOutput(written, aichatContext);
  if (outputModeration !== 'ok') {
    Lab2Registry.getInstance().getMetricsReporter().logWarning({
      message:
        'Adaptive project not used: the generated site did not clear moderation',
      moderation: outputModeration,
      pathwayId: pathway.id,
      stepId: step.id,
      traceId,
    });
    return undefined;
  }
  const seeded = applyGeneratedFiles(sources, output.files);
  if (!seeded) return undefined;
  return {
    name: output.name,
    description: output.description,
    sources: seeded,
    traceId,
  };
}
