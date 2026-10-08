import {Progress} from '@cdo/apps/adaptive/progress';
import {
  ProgressKey,
  localStorageProgressStore as store,
} from '@cdo/apps/adaptive/progress/progressStore';

const key: ProgressKey = {
  userId: 7,
  scriptId: 11,
  levelId: 98263,
  pathwayId: 'sample',
};
const progress: Progress = {
  completed: ['intro'],
  started: ['basics'],
  stepContext: {s1: {generated: {instructions: 'Hi', inputsHash: 'ab'}}},
};

describe('localStorageProgressStore', () => {
  beforeEach(() => window.localStorage.clear());

  it('reads back what it saved', async () => {
    await store.save(key, progress);
    expect(await store.load(key)).toEqual(progress);
  });

  it('has no progress for an unsaved key', async () => {
    expect(await store.load(key)).toBeUndefined();
  });

  it('keeps students, units and levels apart', async () => {
    await store.save(key, progress);
    expect(await store.load({...key, userId: 8})).toBeUndefined();
    expect(await store.load({...key, userId: null})).toBeUndefined();
    expect(await store.load({...key, scriptId: null})).toBeUndefined();
    expect(await store.load({...key, levelId: 1})).toBeUndefined();
  });

  it('loads a record saved before step context existed with an empty cache', async () => {
    await store.save(key, progress);
    const raw = window.localStorage.getItem(
      `adaptive-progress:${key.userId}:${key.scriptId}:${key.levelId}`
    );
    const stored = JSON.parse(raw!);
    delete stored.progress.stepContext;
    window.localStorage.setItem(
      `adaptive-progress:${key.userId}:${key.scriptId}:${key.levelId}`,
      JSON.stringify(stored)
    );
    expect(await store.load(key)).toEqual({...progress, stepContext: {}});
  });

  it('does not resume progress saved for different content', async () => {
    await store.save(key, progress);
    expect(await store.load({...key, pathwayId: 'other'})).toBeUndefined();
  });

  it('treats a corrupt or foreign record as no progress', async () => {
    const storageKey = 'adaptive-progress:7:11:98263';
    window.localStorage.setItem(storageKey, 'not json');
    expect(await store.load(key)).toBeUndefined();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({pathwayId: 'sample', progress: {completed: 'intro'}})
    );
    expect(await store.load(key)).toBeUndefined();
  });
});
