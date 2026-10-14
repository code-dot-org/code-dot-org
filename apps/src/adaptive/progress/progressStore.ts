// Where a student's pathway progress lives: the server, keyed by the unit and
// the adaptive level. Level steps are not written here; their progress is
// their level's own, reported through milestones. Generated instructions stay
// in the browser's local storage until the server stores them.

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

  return {
    async load(key) {
      const response = await http.get(`/adaptive_progress?${query(key)}`);
      const body = (await response.json()) as Partial<Progress>;
      return {...EMPTY_PROGRESS, ...body};
    },

    saveStep(key, stepId, write) {
      return enqueue(`save ${stepId}`, () =>
        http.put(
          `/adaptive_progress/steps/${encodeURIComponent(stepId)}/progress`,
          JSON.stringify({...key, ...write}),
          true,
          {'Content-Type': 'application/json'}
        )
      );
    },
  };
}

export const serverProgressStore = createServerProgressStore();

export interface LocalGeneratedInstructionsKey extends ProgressKey {
  /** Null for a signed-out student, who shares one record per browser. */
  userId: number | null;
  /** Guards the record: content swapped under the level is not resumed. */
  pathwayId: string;
}

export type GeneratedInstructions = {[stepId: string]: GeneratedContent};

export interface LocalGeneratedInstructionsStore {
  load(
    key: LocalGeneratedInstructionsKey
  ): Promise<GeneratedInstructions | undefined>;
  save(
    key: LocalGeneratedInstructionsKey,
    generated: GeneratedInstructions
  ): Promise<void>;
}

interface StoredProgress {
  pathwayId: string;
  progress: {stepContext: {[stepId: string]: {generated: GeneratedContent}}};
  savedAt: string;
}

const storageKey = (key: LocalGeneratedInstructionsKey) =>
  `adaptive-progress:${key.userId ?? 'anonymous'}:${key.scriptId}:${
    key.levelId
  }`;

/**
 * Generated instructions in the browser's local storage. Unavailable storage
 * (private windows, blocked site data) reads as none and drops writes.
 */
export const localGeneratedInstructionsStore: LocalGeneratedInstructionsStore =
  {
    async load(key) {
      try {
        const raw = window.localStorage.getItem(storageKey(key));
        if (!raw) return undefined;
        const stored = JSON.parse(raw) as Partial<StoredProgress>;
        const stepContext = stored.progress?.stepContext;
        if (
          stored.pathwayId !== key.pathwayId ||
          typeof stepContext !== 'object' ||
          stepContext === null
        ) {
          return undefined;
        }
        return Object.fromEntries(
          Object.entries(stepContext).map(([id, {generated}]) => [
            id,
            generated,
          ])
        );
      } catch {
        return undefined;
      }
    },

    async save(key, generated) {
      const stepContext = Object.fromEntries(
        Object.entries(generated).map(([id, content]) => [
          id,
          {generated: content},
        ])
      );
      const stored: StoredProgress = {
        pathwayId: key.pathwayId,
        progress: {stepContext},
        savedAt: new Date().toISOString(),
      };
      try {
        window.localStorage.setItem(storageKey(key), JSON.stringify(stored));
      } catch {
        // Storage unavailable: instructions live for the session only.
      }
    },
  };
