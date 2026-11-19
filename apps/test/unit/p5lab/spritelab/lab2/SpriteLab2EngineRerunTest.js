import SpriteLab2Engine from '@cdo/apps/p5lab/spritelab/lab2/SpriteLab2Engine';

describe('SpriteLab2Engine rerun', () => {
  // The queue only needs these two methods, so they are called on a plain
  // object in place of a whole engine.
  const makeEngine = doRerun => ({
    rerun: SpriteLab2Engine.prototype.rerun,
    doRerun_: doRerun,
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('runs one at a time, in the order asked', async () => {
    const order = [];
    let finishFirst;
    const doRerun = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishFirst = () => {
              order.push('first');
              resolve();
            };
          })
      )
      .mockImplementationOnce(async () => order.push('second'));
    const engine = makeEngine(doRerun);
    engine.rerun();
    const second = engine.rerun();
    await Promise.resolve();
    expect(doRerun).toHaveBeenCalledTimes(1);
    finishFirst();
    await second;
    expect(order).toEqual(['first', 'second']);
  });

  it('still runs after a run that failed', async () => {
    const failure = new Error('preload failed');
    const doRerun = jest
      .fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValue(undefined);
    const engine = makeEngine(doRerun);
    await engine.rerun();
    expect(console.error).toHaveBeenCalledWith(
      'SpriteLab2 run failed:',
      failure
    );
    await engine.rerun();
    expect(doRerun).toHaveBeenCalledTimes(2);
  });

  it('still runs after a run that threw before its first await', async () => {
    const doRerun = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('no p5');
      })
      .mockResolvedValue(undefined);
    const engine = makeEngine(doRerun);
    await engine.rerun();
    await engine.rerun();
    expect(doRerun).toHaveBeenCalledTimes(2);
  });
});
