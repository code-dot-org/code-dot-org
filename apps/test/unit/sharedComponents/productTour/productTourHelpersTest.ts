import {Tour} from 'shepherd.js';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  recordOnboardingTourAbandonment,
  scrollIntoViewIfNeeded,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {tryGetSessionStorage} from '@cdo/apps/utils';

jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  tryGetSessionStorage: jest.fn(),
}));

const mockTryGetSessionStorage = tryGetSessionStorage as jest.MockedFunction<
  typeof tryGetSessionStorage
>;

const makeTour = (currentStepId?: string): Tour =>
  ({
    currentStep: currentStepId ? {id: currentStepId} : undefined,
  } as unknown as Tour);

const makeElement = (rect: Partial<DOMRect>): HTMLElement => {
  const el = document.createElement('div');
  jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    bottom: 100,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect);
  el.scrollIntoView = jest.fn();
  return el;
};

describe('scrollIntoViewIfNeeded', () => {
  const originalInnerHeight = window.innerHeight;

  const setInnerHeight = (height: number) => {
    Object.defineProperty(window, 'innerHeight', {
      value: height,
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    setInnerHeight(768);
  });

  afterEach(() => {
    setInnerHeight(originalInnerHeight);
  });

  it('does not scroll when element is fully visible', () => {
    const el = makeElement({top: 100, bottom: 400});
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not scroll when element sits exactly at viewport boundaries', () => {
    const el = makeElement({top: 0, bottom: 768});
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls to center when element top is above the viewport', () => {
    const el = makeElement({top: -50, bottom: 100});
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({block: 'center'});
  });

  it('scrolls to center when element bottom is below the viewport', () => {
    const el = makeElement({top: 600, bottom: 900});
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({block: 'center'});
  });

  it('scrolls to center when element is entirely below the viewport', () => {
    const el = makeElement({top: 800, bottom: 1000});
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({block: 'center'});
  });

  // Shepherd passes undefined for a centered step that has no attachTo target.
  it('does nothing when the element is undefined', () => {
    expect(() => scrollIntoViewIfNeeded(undefined)).not.toThrow();
  });
});

describe('recordOnboardingTourAbandonment', () => {
  let sendEventSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    sendEventSpy = jest
      .spyOn(analyticsReporter, 'sendEvent')
      .mockImplementation(jest.fn());
  });

  it('sends the abandoned event with the current step id when nothing is pending', () => {
    mockTryGetSessionStorage.mockReturnValue('');

    recordOnboardingTourAbandonment(
      makeTour('step-1'),
      'session-key',
      'my_tour'
    );

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.ONBOARDING_TOUR_ABANDONED,
      {tour_name: 'my_tour', step_id: 'step-1'}
    );
  });

  it('sends the abandoned event when the pending step matches the current step', () => {
    mockTryGetSessionStorage.mockReturnValue('step-1');

    recordOnboardingTourAbandonment(
      makeTour('step-1'),
      'session-key',
      'my_tour'
    );

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.ONBOARDING_TOUR_ABANDONED,
      {tour_name: 'my_tour', step_id: 'step-1'}
    );
  });

  // A hand-off click handler saves the destination page's step id and calls
  // step.hide() rather than tour.cancel(). The tour is only cancelled later
  // by the destination page's resume function, at which point sessionStorage
  // holds that different, pending step id rather than the tour's own
  // (unmoved) currentStep — this is not a real abandonment.
  it('does not send an event when a different step is pending (a hand-off to the next page)', () => {
    mockTryGetSessionStorage.mockReturnValue('next-page-step');

    recordOnboardingTourAbandonment(
      makeTour('step-1'),
      'session-key',
      'my_tour'
    );

    expect(sendEventSpy).not.toHaveBeenCalled();
  });

  it('sends the event with an undefined step id when the tour has no current step', () => {
    mockTryGetSessionStorage.mockReturnValue('');

    recordOnboardingTourAbandonment(
      makeTour(undefined),
      'session-key',
      'my_tour'
    );

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.ONBOARDING_TOUR_ABANDONED,
      {tour_name: 'my_tour', step_id: undefined}
    );
  });
});
