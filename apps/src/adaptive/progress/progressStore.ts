// Where a student's pathway progress lives: the server, keyed by the unit and
// the adaptive level. A level step's progress is not written here; it is its
// level's own, reported through milestones.

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import HttpClient from '@cdo/apps/util/HttpClient';

import {Answer, EMPTY_PROGRESS, GeneratedContent, Progress} from './model';

export interface ProgressKey {
  scriptId: number;
  levelId: number;
}

/** One save of a non-level step; the server sets times only once. */
export interface StepWrite {
  started?: true;
  completed?: true;
  timeSinceLastSave?: number;
  answers?: {questionId: number | string; list: Answer[]};
}

export interface ProgressStore {
  load(key: ProgressKey): Promise<Progress>;
  saveStep(key: ProgressKey, stepId: string, write: StepWrite): Promise<void>;
  saveInstructions(
    key: ProgressKey,
    stepId: string,
    content: GeneratedContent
  ): Promise<void>;
}

const query = ({scriptId, levelId}: ProgressKey) =>
  `scriptId=${scriptId}&levelId=${levelId}`;

/** Sends writes one at a time, in order; a failed one is logged and skipped. */
export function createServerProgressStore(
  http: Pick<typeof HttpClient, 'get' | 'put'> = HttpClient
): ProgressStore {
  let chain: Promise<void> = Promise.resolve();
  const enqueue = (label: string, request: () => Promise<unknown>) => {
    chain = chain.then(request).then(
      () => undefined,
      error =>
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError(`Adaptive progress: ${label} failed`, error as Error)
    );
    return chain;
  };
  const putStep = (
    key: ProgressKey,
    stepId: string,
    route: string,
    body: object
  ) =>
    http.put(
      `/adaptive_progress/steps/${encodeURIComponent(stepId)}/${route}`,
      JSON.stringify({...key, ...body}),
      true,
      {'Content-Type': 'application/json'}
    );

  return {
    async load(key) {
      const response = await http.get(`/adaptive_progress?${query(key)}`);
      const body = (await response.json()) as Partial<Progress>;
      return {...EMPTY_PROGRESS, ...body};
    },

    saveStep(key, stepId, write) {
      return enqueue(`save ${stepId}`, () =>
        putStep(key, stepId, 'progress', write)
      );
    },

    saveInstructions(key, stepId, content) {
      return enqueue(`save instructions for ${stepId}`, () =>
        putStep(key, stepId, 'generated_instructions', {
          generatedInstructions: content,
        })
      );
    },
  };
}

export const serverProgressStore = createServerProgressStore();
