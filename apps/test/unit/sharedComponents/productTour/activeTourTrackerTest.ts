// jest.resetModules() in beforeEach gives each test a fresh module instance,
// resetting the module-level activeTour variable between tests.

jest.mock('shepherd.js', () => ({__esModule: true, default: {}}));

type FakeTour = {
  cancel: jest.Mock;
  on: (evt: string, cb: () => void) => void;
  fire: (evt: string) => void;
};

const makeTour = (): FakeTour => {
  const events: Record<string, Array<() => void>> = {};
  return {
    cancel: jest.fn(),
    on(evt: string, cb: () => void) {
      if (!events[evt]) events[evt] = [];
      events[evt].push(cb);
    },
    fire(evt: string) {
      (events[evt] ?? []).forEach(cb => cb());
    },
  };
};

let registerActiveTour: (tour: FakeTour) => void;

beforeEach(() => {
  jest.resetModules();
  registerActiveTour = (
    require('@cdo/apps/sharedComponents/productTour/activeTourTracker') as {
      registerActiveTour: (tour: FakeTour) => void;
    }
  ).registerActiveTour;
});

describe('registerActiveTour', () => {
  it('does not cancel anything when the first tour starts', () => {
    const tourA = makeTour();
    registerActiveTour(tourA);
    tourA.fire('start');
    expect(tourA.cancel).not.toHaveBeenCalled();
  });

  it('cancels the active tour when a new tour starts', () => {
    const tourA = makeTour();
    const tourB = makeTour();
    registerActiveTour(tourA);
    registerActiveTour(tourB);

    tourA.fire('start');
    tourB.fire('start');

    expect(tourA.cancel).toHaveBeenCalledTimes(1);
    expect(tourB.cancel).not.toHaveBeenCalled();
  });

  it('does not cancel a tour that starts itself a second time', () => {
    const tourA = makeTour();
    registerActiveTour(tourA);
    tourA.fire('start');
    tourA.fire('start');
    expect(tourA.cancel).not.toHaveBeenCalled();
  });

  it('clears the tracker on complete so a subsequent tour start cancels nothing', () => {
    const tourA = makeTour();
    const tourB = makeTour();
    registerActiveTour(tourA);
    registerActiveTour(tourB);

    tourA.fire('start');
    tourA.fire('complete');

    tourB.fire('start');
    expect(tourA.cancel).not.toHaveBeenCalled();
  });

  it('clears the tracker on cancel so a subsequent tour start cancels nothing', () => {
    const tourA = makeTour();
    const tourB = makeTour();
    registerActiveTour(tourA);
    registerActiveTour(tourB);

    tourA.fire('start');
    tourA.fire('cancel');

    tourB.fire('start');
    expect(tourA.cancel).not.toHaveBeenCalled();
  });

  it('does not clear the tracker when a non-active tour fires complete', () => {
    // tourA is active; tourB finishes independently (edge case).
    // tourA should remain tracked so a later tourC start still cancels tourA.
    const tourA = makeTour();
    const tourB = makeTour();
    const tourC = makeTour();
    registerActiveTour(tourA);
    registerActiveTour(tourB);
    registerActiveTour(tourC);

    tourA.fire('start');
    tourB.fire('complete'); // tourB was never active — should not clear tourA
    tourC.fire('start');

    expect(tourA.cancel).toHaveBeenCalledTimes(1);
  });
});
