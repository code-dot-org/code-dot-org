// Generates a project step's project before its lab mounts: the template
// rewritten from the student's answers and saved, and the project named and
// described from the same call. Whether to generate is the step's decision;
// this takes it once, when it is known, and ignores later changes.

import {useEffect, useRef, useState} from 'react';

import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {Channel, ProjectSources} from '@cdo/apps/lab2/types';

import {
  GenerateProjectOptions,
  generateProject,
} from '../../ai/generateProject';
import {PROJECT_PROMPT_VERSION} from '../../ai/projectPrompt';
import {GENERATION_TRACE_KEY} from '../../project/projectGeneration';

export interface ProjectGenerationState {
  /** False while a generated project may still land; the lab waits for it. */
  isResolved: boolean;
}

export interface UseGenerateProjectOptions
  extends Omit<GenerateProjectOptions, 'sources'> {
  /** Whether to generate; undefined while the project is loading and the answer is not known. */
  shouldGenerate: boolean | undefined;
  /** The project's sources; undefined until loaded. */
  sources: ProjectSources | undefined;
  channel: Channel | undefined;
  projectManager: ProjectManager | null;
  /** Replaces the project's sources and saves them. */
  updateSources: (sources: ProjectSources, forceSave?: boolean) => void;
}

export function useGenerateProject({
  shouldGenerate,
  sources,
  channel,
  projectManager,
  updateSources,
  pathway,
  checkpoint,
  step,
  progress,
  projectInfo,
  aichatContext,
}: UseGenerateProjectOptions): ProjectGenerationState {
  const [resolved, setResolved] = useState(shouldGenerate === false);
  const started = useRef(false);
  const unmounted = useRef(false);
  useEffect(
    () => () => {
      unmounted.current = true;
    },
    []
  );

  useEffect(() => {
    if (shouldGenerate === undefined || started.current) return;
    if (!shouldGenerate) {
      setResolved(true);
      return;
    }
    if (!sources || !channel || !projectManager) return;
    started.current = true;

    const generate = async () => {
      const generated = await generateProject({
        pathway,
        checkpoint,
        step,
        progress,
        projectInfo,
        aichatContext,
        sources,
      });
      if (unmounted.current) return;
      if (generated) {
        updateSources(generated.sources, true);
        await projectManager.updateChannel(
          {
            name: generated.name,
            labConfig: {
              ...channel.labConfig,
              adaptive: {
                ...channel.labConfig?.adaptive,
                description: generated.description,
                [GENERATION_TRACE_KEY]: generated.traceId,
                generationPromptVersion: PROJECT_PROMPT_VERSION,
              },
            },
          },
          true
        );
      }
      if (!unmounted.current) setResolved(true);
    };
    generate();
  }, [
    shouldGenerate,
    sources,
    channel,
    projectManager,
    updateSources,
    pathway,
    checkpoint,
    step,
    progress,
    projectInfo,
    aichatContext,
  ]);

  return {isResolved: resolved};
}
