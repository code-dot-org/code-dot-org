// Where a student's pathway progress lives: the server, keyed by the unit and
// the adaptive level. Level steps are not written here; their progress is
// their level's own, reported through milestones. Generated instructions stay
// in the browser's local storage until the server stores them.

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import HttpClient from '@cdo/apps/util/HttpClient';

import {Answer, EMPTY_PROGRESS, Progress, StepContext} from './model';

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
          `/adaptive_progress/steps/${encodeURIComponent(stepId)}/progress`,
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

export interface LocalProgressKey extends ProgressKey {
  /** Null for a signed-out student, who shares one record per browser. */
  userId: number | null;
  /** Guards the record: content swapped under the level is not resumed. */
  pathwayId: string;
}

export type LocalStepContext = {
  [stepId: string]: Pick<StepContext, 'generated'>;
};

export interface LocalProgressStore {
  load(key: LocalProgressKey): Promise<LocalStepContext | undefined>;
  save(key: LocalProgressKey, stepContext: LocalStepContext): Promise<void>;
}

interface StoredProgress {
  pathwayId: string;
  progress: {stepContext: LocalStepContext};
  savedAt: string;
}

const storageKey = (key: LocalProgressKey) =>
  `adaptive-progress:${key.userId ?? 'anonymous'}:${key.scriptId}:${
    key.levelId
  }`;

/**
 * Generated instructions in the browser's local storage. Unavailable storage
 * (private windows, blocked site data) reads as none and drops writes.
 */
export const localStorageProgressStore: LocalProgressStore = {
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
      // Older records also hold answers, which now come from the server.
      const loaded: LocalStepContext = {};
      for (const [id, context] of Object.entries(stepContext)) {
        if (context?.generated) loaded[id] = {generated: context.generated};
      }
      return loaded;
    } catch {
      return undefined;
    }
  },

  async save(key, stepContext) {
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
