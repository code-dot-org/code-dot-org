import {act, renderHook} from '@testing-library/react-hooks';

import {
  EMPTY_PROGRESS,
  Progress,
  checkpointStatus,
  getStatusMap,
  useProgress,
} from '@cdo/apps/adaptive/progress';
import {Checkpoint, Pathway} from '@cdo/apps/adaptive/types';

const checkpoint = (id: string, requires?: string[]): Checkpoint => ({
  id,
  title: id,
  description: id,
  requires,
  steps: [
    {
      id: `${id}-step`,
      title: id,
      kind: 'panels',
      panels: [{key: `${id}-1`, imageUrl: 'x.png', text: id}],
    },
  ],
});

const progressOf = (completed: string[], started: string[]): Progress => ({
  ...EMPTY_PROGRESS,
  completed,
  started,
});

const pathway = {
  checkpoints: [
    checkpoint('intro'),
    checkpoint('a', ['intro']),
    checkpoint('b', ['intro', 'a']),
  ],
} as Pathway;

describe('checkpointStatus', () => {
  it('is available with no requires, locked until requires are complete', () => {
    const progress = progressOf([], []);
    expect(checkpointStatus(pathway.checkpoints[0], progress)).toBe(
      'available'
    );
    expect(checkpointStatus(pathway.checkpoints[1], progress)).toBe('locked');
  });

  it('needs every required checkpoint, not just one', () => {
    const progress = progressOf(['intro'], []);
    expect(checkpointStatus(pathway.checkpoints[1], progress)).toBe(
      'available'
    );
    expect(checkpointStatus(pathway.checkpoints[2], progress)).toBe('locked');
  });

  it('reports in progress once started and complete over everything else', () => {
    const progress = progressOf(['intro'], ['a', 'intro']);
    expect(checkpointStatus(pathway.checkpoints[1], progress)).toBe(
      'inProgress'
    );
    expect(checkpointStatus(pathway.checkpoints[0], progress)).toBe('complete');
  });
});

describe('getStatusMap', () => {
  it('maps every checkpoint id to its status', () => {
    expect(getStatusMap(pathway, progressOf(['intro', 'a'], []))).toEqual({
      intro: 'complete',
      a: 'complete',
      b: 'available',
    });
  });
});

describe('useProgress', () => {
  const pathway = {
    checkpoints: [
      {id: 'intro', steps: []},
      {id: 'basics', requires: ['intro'], steps: []},
    ],
  } as unknown as Pathway;
  const key = {userId: 1, scriptId: null, levelId: 5, pathwayId: 'p'};
  const fakeStore = (initial?: Progress) => {
    const saved: Progress[] = [];
    return {
      saved,
      load: jest.fn().mockResolvedValue(initial),
      save: jest.fn().mockImplementation(async (_k, p: Progress) => {
        saved.push(p);
      }),
    };
  };

  it('hydrates from the store before reporting statuses', async () => {
    const store = fakeStore(progressOf(['intro'], []));
    const {result, waitForNextUpdate} = renderHook(() =>
      useProgress(pathway, key, store)
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.progress).toBeUndefined();
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.statusMap).toEqual({
      intro: 'complete',
      basics: 'available',
    });
    expect(store.load).toHaveBeenCalledWith(key);
  });

  it('saves each change after hydration and nothing before', async () => {
    const store = fakeStore(undefined);
    const {result, waitForNextUpdate} = renderHook(() =>
      useProgress(pathway, key, store)
    );
    expect(store.saved).toEqual([]);
    act(() => result.current.markStarted('intro'));
    expect(store.saved).toEqual([]);
    await waitForNextUpdate();
    const savesAfterLoad = store.saved.length;
    act(() => result.current.markStarted('intro'));
    act(() => result.current.markComplete('intro'));
    expect(store.saved.slice(savesAfterLoad)).toEqual([
      progressOf([], ['intro']),
      progressOf(['intro'], ['intro']),
    ]);
    act(() => result.current.reset());
    expect(store.saved[store.saved.length - 1]).toEqual(EMPTY_PROGRESS);
  });

  it('merges step context by step id and saves it', async () => {
    const store = fakeStore(undefined);
    const {result, waitForNextUpdate} = renderHook(() =>
      useProgress(pathway, key, store)
    );
    await waitForNextUpdate();
    const generated = {instructions: 'Hi', inputsHash: 'ab'};
    act(() => result.current.updateStepContext('s1', {generated}));
    expect(result.current.progress?.stepContext).toEqual({s1: {generated}});
    expect(store.saved[store.saved.length - 1].stepContext).toEqual({
      s1: {generated},
    });
  });
});
