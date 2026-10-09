import {createServerProgressStore} from '@cdo/apps/adaptive/progress/progressStore';

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

describe('createServerProgressStore', () => {
  const http = {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    http.put.mockResolvedValue({ok: true});
    http.delete.mockResolvedValue({ok: true});
  });

  it('loads the steps for the unit and level', async () => {
    const steps = {read: {status: 'complete', timeSpent: 4}};
    http.get.mockResolvedValue({json: async () => ({steps})});
    const store = createServerProgressStore(http);

    expect(await store.load(key)).toEqual({steps});
    expect(http.get).toHaveBeenCalledWith(
      '/adaptive_progress?scriptId=11&levelId=98263'
    );
  });

  it('sends writes one at a time, in order', async () => {
    const first = deferred();
    http.put.mockReturnValueOnce(first.promise);
    const store = createServerProgressStore(http);

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
      ['/adaptive_progress/steps/read', {...key, started: true}],
      [
        '/adaptive_progress/steps/read',
        {...key, completed: true, timeSinceLastSave: 900},
      ],
    ]);
  });

  it('logs a failed write and still sends the next', async () => {
    http.put.mockRejectedValueOnce(new Error('500'));
    const store = createServerProgressStore(http);

    store.saveStep(key, 'read', {started: true});
    await store.reset(key);

    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(http.delete).toHaveBeenCalledWith(
      '/adaptive_progress?scriptId=11&levelId=98263',
      true
    );
  });
});
