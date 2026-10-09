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

/** One save of a step; a level step may carry only generatedInstructions. */
export interface StepWrite {
  started?: true;
  completed?: true;
  timeSinceLastSave?: number;
  answers?: {questionId: number | string; list: Answer[]};
  generatedInstructions?: GeneratedContent;
}

export interface ProgressStore {
  load(key: ProgressKey): Promise<Progress>;
  saveStep(key: ProgressKey, stepId: string, write: StepWrite): Promise<void>;
  reset(key: ProgressKey): Promise<void>;
}

const query = ({scriptId, levelId}: ProgressKey) =>
  `scriptId=${scriptId}&levelId=${levelId}`;

/** Sends writes one at a time, in order; a failed one is logged and skipped. */
export function createServerProgressStore(
  http: Pick<typeof HttpClient, 'get' | 'put' | 'delete'> = HttpClient
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

  return {
    async load(key) {
      const response = await http.get(`/adaptive_progress?${query(key)}`);
      const body = (await response.json()) as Partial<Progress>;
      return {...EMPTY_PROGRESS, ...body};
    },

    saveStep(key, stepId, write) {
      return enqueue(`save ${stepId}`, () =>
        http.put(
          `/adaptive_progress/steps/${encodeURIComponent(stepId)}`,
          JSON.stringify({...key, ...write}),
          true,
          {'Content-Type': 'application/json'}
        )
      );
    },

    reset(key) {
      return enqueue('reset', () =>
        http.delete(`/adaptive_progress?${query(key)}`, true)
      );
    },
  };
}

export const serverProgressStore = createServerProgressStore();
