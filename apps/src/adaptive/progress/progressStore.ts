// Where a student's pathway progress lives: the server, keyed by the unit and
// the adaptive level. A level step's progress is not written here; it is its
// level's own, reported through milestones.

import HttpClient from '@cdo/apps/util/HttpClient';

import {countAdaptive, httpStatus, reportAdaptiveError} from '../observability';

import {
  Answer,
  EMPTY_PROGRESS,
  GeneratedContent,
  Progress,
  ValidationAttempt,
} from './model';

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

const query = ({scriptId, levelId}: ProgressKey) =>
  `scriptId=${scriptId}&levelId=${levelId}`;

type PutRoute = 'progress' | 'generated_instructions' | 'validation_history';

export type ProgressRoute = PutRoute | 'load' | 'level_step';

export function recordProgressOk(route: ProgressRoute) {
  countAdaptive('Adaptive.ProgressRequest', {Route: route, Outcome: 'ok'});
}

export function recordProgressFailure(
  route: ProgressRoute,
  error: unknown,
  stepId?: string
) {
  const status = httpStatus(error);
  countAdaptive('Adaptive.ProgressRequest', {
    Route: route,
    Outcome: 'error',
    Status: status,
  });
  reportAdaptiveError(`Adaptive progress: ${route} failed`, error, {
    route,
    stepId,
    status,
  });
}

/** Sends writes one at a time, in order; a failed one is logged and skipped. */
export class ProgressStore {
  private chain: Promise<void> = Promise.resolve();

  async load(key: ProgressKey): Promise<Progress> {
    const response = await HttpClient.get(`/adaptive_progress?${query(key)}`);
    const body = (await response.json()) as Partial<Progress>;
    return {...EMPTY_PROGRESS, ...body};
  }

  saveStep(key: ProgressKey, stepId: string, write: StepWrite): Promise<void> {
    return this.enqueue(key, stepId, 'progress', write);
  }

  saveInstructions(
    key: ProgressKey,
    stepId: string,
    content: GeneratedContent
  ): Promise<void> {
    return this.enqueue(key, stepId, 'generated_instructions', {
      generatedInstructions: content,
    });
  }

  /** Appends one check of a project step's work; the server sets its time. */
  saveValidation(
    key: ProgressKey,
    stepId: string,
    attempt: Omit<ValidationAttempt, 'at'>
  ): Promise<void> {
    return this.enqueue(key, stepId, 'validation_history', {attempt});
  }

  private enqueue(
    key: ProgressKey,
    stepId: string,
    route: PutRoute,
    body: object
  ) {
    const put = () =>
      HttpClient.put(
        `/adaptive_progress/steps/${encodeURIComponent(stepId)}/${route}`,
        JSON.stringify({...key, ...body}),
        true,
        {'Content-Type': 'application/json'}
      );
    this.chain = this.chain.then(put).then(
      () => recordProgressOk(route),
      error => recordProgressFailure(route, error, stepId)
    );
    return this.chain;
  }
}

export const serverProgressStore = new ProgressStore();
