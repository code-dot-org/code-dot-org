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
  /** The only write a level step takes here; its other progress is its level's. */
  skipped?: true;
  timeSinceLastSave?: number;
  answers?: {questionId: number | string; list: Answer[]};
}

const query = ({scriptId, levelId}: ProgressKey) =>
  `scriptId=${scriptId}&levelId=${levelId}`;

/** Sends writes one at a time, in order; a failed one is logged and skipped. */
export class ProgressStore {
  private chain: Promise<void> = Promise.resolve();

  async load(key: ProgressKey): Promise<Progress> {
    const response = await HttpClient.get(`/adaptive_progress?${query(key)}`);
    const body = (await response.json()) as Partial<Progress>;
    return {...EMPTY_PROGRESS, ...body};
  }

  saveStep(key: ProgressKey, stepId: string, write: StepWrite): Promise<void> {
    return this.enqueue(`save ${stepId}`, () =>
      this.putStep(key, stepId, 'progress', write)
    );
  }

  saveInstructions(
    key: ProgressKey,
    stepId: string,
    content: GeneratedContent
  ): Promise<void> {
    return this.enqueue(`save instructions for ${stepId}`, () =>
      this.putStep(key, stepId, 'generated_instructions', {
        generatedInstructions: content,
      })
    );
  }

  private putStep(
    key: ProgressKey,
    stepId: string,
    route: string,
    body: object
  ) {
    return HttpClient.put(
      `/adaptive_progress/steps/${encodeURIComponent(stepId)}/${route}`,
      JSON.stringify({...key, ...body}),
      true,
      {'Content-Type': 'application/json'}
    );
  }

  private enqueue(label: string, request: () => Promise<unknown>) {
    this.chain = this.chain.then(request).then(
      () => undefined,
      error =>
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError(`Adaptive progress: ${label} failed`, error as Error)
    );
    return this.chain;
  }
}

export const serverProgressStore = new ProgressStore();
