import {
  LocalGeneratedInstructionsKey,
  GeneratedInstructions,
  ProgressStore,
  localGeneratedInstructionsStore as generatedStore,
} from '@cdo/apps/adaptive/progress/progressStore';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {get: jest.fn(), put: jest.fn()},
}));

const mockLogError = jest.fn();
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({getMetricsReporter: () => ({logError: mockLogError})}),
  },
}));

const key = {scriptId: 11, levelId: 98263};

const deferred = () => {
  let resolve: () => void = () => {};
  const promise = new Promise<Response>(r => {
    resolve = () => r({ok: true} as Response);
  });
  return {promise, resolve};
};

describe('ProgressStore', () => {
  const http = {
    get: HttpClient.get as jest.Mock,
    put: HttpClient.put as jest.Mock,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    http.put.mockResolvedValue({ok: true});
  });

  it('loads the steps for the unit and level', async () => {
    const steps = {read: {status: 'complete', timeSpent: 4}};
    http.get.mockResolvedValue({json: async () => ({steps})});
    const store = new ProgressStore();

    expect(await store.load(key)).toEqual({steps});
    expect(http.get).toHaveBeenCalledWith(
      '/adaptive_progress?scriptId=11&levelId=98263'
    );
  });

  it('sends writes one at a time, in order', async () => {
    const first = deferred();
    http.put.mockReturnValueOnce(first.promise);
    const store = new ProgressStore();

    const saves = [
      store.saveStep(key, 'read', {started: true}),
      store.saveStep(key, 'read', {completed: true, timeSinceLastSave: 900}),
    ];
    await Promise.resolve();
    expect(http.put).toHaveBeenCalledTimes(1);

    first.resolve();
    await Promise.all(saves);

    expect(
      http.put.mock.calls.map(call => [call[0], JSON.parse(call[1])])
    ).toEqual([
      ['/adaptive_progress/steps/read/progress', {...key, started: true}],
      [
        '/adaptive_progress/steps/read/progress',
        {...key, completed: true, timeSinceLastSave: 900},
      ],
    ]);
  });

  it('logs a failed write and still sends the next', async () => {
    http.put.mockRejectedValueOnce(new Error('500'));
    const store = new ProgressStore();

    store.saveStep(key, 'read', {started: true});
    await store.saveStep(key, 'read', {completed: true});

    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(http.put).toHaveBeenCalledTimes(2);
  });
});

describe('localGeneratedInstructionsStore', () => {
  const generatedKey: LocalGeneratedInstructionsKey = {
    userId: 7,
    ...key,
    pathwayId: 'sample',
  };
  const storageKey = 'adaptive-progress:7:11:98263';
  const content = {instructions: 'Hi', inputsHash: 'ab', traceId: 't'};
  const generated: GeneratedInstructions = {s1: content};

  beforeEach(() => window.localStorage.clear());

  it('reads back what it saved', async () => {
    await generatedStore.save(generatedKey, generated);
    expect(await generatedStore.load(generatedKey)).toEqual(generated);
  });

  it('has nothing for an unsaved key', async () => {
    expect(await generatedStore.load(generatedKey)).toBeUndefined();
  });

  it('keeps students, units and levels apart', async () => {
    await generatedStore.save(generatedKey, generated);
    expect(
      await generatedStore.load({...generatedKey, userId: 8})
    ).toBeUndefined();
    expect(
      await generatedStore.load({...generatedKey, userId: null})
    ).toBeUndefined();
    expect(
      await generatedStore.load({...generatedKey, scriptId: 12})
    ).toBeUndefined();
    expect(
      await generatedStore.load({...generatedKey, levelId: 1})
    ).toBeUndefined();
  });

  it('does not resume instructions saved for different content', async () => {
    await generatedStore.save(generatedKey, generated);
    expect(
      await generatedStore.load({...generatedKey, pathwayId: 'other'})
    ).toBeUndefined();
  });

  it('stores each step under stepContext', async () => {
    await generatedStore.save(generatedKey, generated);
    const stored = JSON.parse(window.localStorage.getItem(storageKey)!);
    expect(stored.progress).toEqual({stepContext: {s1: {generated: content}}});
  });

  it('treats a corrupt or foreign record as nothing', async () => {
    window.localStorage.setItem(storageKey, 'not json');
    expect(await generatedStore.load(generatedKey)).toBeUndefined();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({pathwayId: 'sample', progress: {stepContext: null}})
    );
    expect(await generatedStore.load(generatedKey)).toBeUndefined();
  });
});
