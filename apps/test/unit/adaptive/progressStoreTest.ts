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
const progress: Progress = {completed: ['intro'], started: ['basics']};

describe('localStorageProgressStore', () => {
  beforeEach(() => window.localStorage.clear());

  it('reads back what it saved', async () => {
    await store.save(key, progress);
    expect(await store.load(key)).toEqual(progress);
  });

  it('reads back answers saved with the progress', async () => {
    const withAnswers: Progress = {
      ...progress,
      questionAnswers: {survey: {1: 'a', 2: 'b'}},
    };
    await store.save(key, withAnswers);
    expect(await store.load(key)).toEqual(withAnswers);
  });

  it('loads a record saved before answers existed', async () => {
    window.localStorage.setItem(
      'adaptive-progress:7:11:98263',
      JSON.stringify({pathwayId: 'sample', progress})
    );
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
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        pathwayId: 'sample',
        progress: {...progress, questionAnswers: 1},
      })
    );
    expect(await store.load(key)).toBeUndefined();
  });
});
