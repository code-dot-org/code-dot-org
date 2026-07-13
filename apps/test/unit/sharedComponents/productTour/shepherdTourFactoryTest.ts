import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';

// Self-contained mock: no outer variable refs since jest.mock is hoisted before
// variable declarations. State is stored in closures and exposed via __testApi.
jest.mock('shepherd.js', () => {
  const tourEvents: Record<string, Array<() => void>> = {};
  const stepEvents: Record<string, Array<() => void>> = {};

  const mockStep = {
    id: 'test-step',
    options: {attachTo: null as {element: string; on: string} | null},
    on(evt: string, cb: () => void) {
      if (!stepEvents[evt]) stepEvents[evt] = [];
      stepEvents[evt].push(cb);
    },
    off(evt: string, cb: () => void) {
      stepEvents[evt] = (stepEvents[evt] ?? []).filter(h => h !== cb);
    },
  };

  const cancelMock = jest.fn();

  const mockTour = {
    currentStep: mockStep as typeof mockStep | null,
    cancel: cancelMock,
    on(evt: string, cb: () => void) {
      if (!tourEvents[evt]) tourEvents[evt] = [];
      tourEvents[evt].push(cb);
    },
  };

  return {
    __esModule: true,
    default: {
      Tour: jest.fn(() => mockTour),
      activeTour: null,
    },
    __testApi: {
      tour: mockTour,
      step: mockStep,
      cancelMock,
      fireTourEvent(evt: string) {
        (tourEvents[evt] ?? []).forEach(cb => cb());
      },
      fireStepEvent(evt: string) {
        (stepEvents[evt] ?? []).forEach(cb => cb());
      },
      resetHandlers() {
        Object.keys(tourEvents).forEach(k => delete tourEvents[k]);
        Object.keys(stepEvents).forEach(k => delete stepEvents[k]);
      },
    },
  };
});

type MockStep = {
  id: string;
  options: {attachTo: {element: string; on: string} | null};
  on: (evt: string, cb: () => void) => void;
  off: (evt: string, cb: () => void) => void;
};

type MockTour = {
  currentStep: MockStep | null;
  cancel: jest.Mock;
  on: (evt: string, cb: () => void) => void;
};

type TestApi = {
  tour: MockTour;
  step: MockStep;
  cancelMock: jest.Mock;
  fireTourEvent: (evt: string) => void;
  fireStepEvent: (evt: string) => void;
  resetHandlers: () => void;
};

const api = (require('shepherd.js') as {__testApi: TestApi}).__testApi;

const ANCHOR_SELECTOR = '#test-anchor';

describe('createShepherdTour — anchor-watching MutationObserver', () => {
  let anchorEl: HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();
    api.resetHandlers();

    api.step.options.attachTo = {element: ANCHOR_SELECTOR, on: 'bottom'};
    api.tour.currentStep = api.step;

    // Register the factory's event handlers on the mock tour.
    createShepherdTour({stepClass: 'test-class'});

    anchorEl = document.createElement('div');
    anchorEl.id = 'test-anchor';
    document.body.appendChild(anchorEl);
  });

  afterEach(() => {
    anchorEl?.remove();
    api.tour.currentStep = api.step;
  });

  it('cancels the tour when the anchor element is removed from the DOM', async () => {
    api.fireTourEvent('show');

    anchorEl.remove();
    await Promise.resolve();

    expect(api.cancelMock).toHaveBeenCalled();
  });

  it('does not set up an observer when the step has no attachTo', async () => {
    api.step.options.attachTo = null;
    api.fireTourEvent('show');

    anchorEl.remove();
    await Promise.resolve();

    expect(api.cancelMock).not.toHaveBeenCalled();
  });

  it('does not set up an observer when the anchor is not in the DOM at show time', async () => {
    anchorEl.remove();
    api.fireTourEvent('show');

    // Nothing left to remove, but observer was never created so cancel stays silent.
    await Promise.resolve();

    expect(api.cancelMock).not.toHaveBeenCalled();
  });

  it('disconnects the observer when the step hides without advancing (onStepHide)', async () => {
    // This covers the learnToEvaluate pattern: a click handler calls step.hide()
    // to hand off to the next page, then SPA navigation tears down the DOM.
    // The observer must not fire tour.cancel() after the intentional hide.
    api.fireTourEvent('show');
    api.fireStepEvent('hide');

    anchorEl.remove();
    await Promise.resolve();

    expect(api.cancelMock).not.toHaveBeenCalled();
  });

  it('disconnects the observer when the tour completes normally', async () => {
    api.fireTourEvent('show');
    api.fireTourEvent('complete');

    anchorEl.remove();
    await Promise.resolve();

    expect(api.cancelMock).not.toHaveBeenCalled();
  });

  it('disconnects the observer when the tour is cancelled externally', async () => {
    // e.g. user clicks X on the tour step — Shepherd fires 'cancel',
    // which should disconnect the observer so removing the anchor later
    // does not call tour.cancel() a second time.
    api.fireTourEvent('show');
    api.fireTourEvent('cancel');

    anchorEl.remove();
    await Promise.resolve();

    expect(api.cancelMock).not.toHaveBeenCalled();
  });

  it('removes all tour-step-highlight elements from the DOM when the tour is cancelled', () => {
    const elA = document.createElement('div');
    elA.classList.add('tour-step-highlight');
    const elB = document.createElement('div');
    elB.classList.add('tour-step-highlight', 'some-other-class');
    document.body.appendChild(elA);
    document.body.appendChild(elB);

    api.fireTourEvent('show');
    api.fireTourEvent('cancel');

    expect(elA.classList.contains('tour-step-highlight')).toBe(false);
    expect(elB.classList.contains('tour-step-highlight')).toBe(false);
    expect(elB.classList.contains('some-other-class')).toBe(true);

    elA.remove();
    elB.remove();
  });

  it('replaces the previous observer when a new step shows', async () => {
    // First step: anchor A in DOM → observer watching A.
    api.fireTourEvent('show');

    // Second 'show' (e.g. tour advances) with a different anchor.
    const anchorB = document.createElement('div');
    anchorB.id = 'anchor-b';
    document.body.appendChild(anchorB);
    api.step.options.attachTo = {element: '#anchor-b', on: 'bottom'};
    api.fireTourEvent('show'); // stopWatchingAnchor() then new observer for B.

    // Removing the OLD anchor should not cancel the tour.
    anchorEl.remove();
    await Promise.resolve();
    expect(api.cancelMock).not.toHaveBeenCalled();

    // Removing the NEW anchor SHOULD cancel.
    anchorB.remove();
    await Promise.resolve();
    expect(api.cancelMock).toHaveBeenCalled();

    anchorB.remove(); // idempotent no-op for afterEach
  });
});
