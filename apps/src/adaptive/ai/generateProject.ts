// A generated project: the template rewritten around the student's answers
// by one model call, laid over the template's sources. No answers, no
// editable files, adaptive AI off or a failed call all mean nothing is
// generated, and the template stands.

import {AichatContext} from '@cdo/apps/aichat/types';
import {ProjectSources} from '@cdo/apps/lab2/types';

import {Progress} from '../progress/model';
import {
  applyGeneratedFiles,
  freeResponseAnswers,
  editableFiles,
} from '../project/projectGeneration';
import {Checkpoint, LevelStep, Pathway, PathwayProjectInfo} from '../types';

import {generate} from './generate';
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
