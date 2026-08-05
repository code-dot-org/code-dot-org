import {renderHook} from '@testing-library/react-hooks';
import Shepherd, {Tour} from 'shepherd.js';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {recordOnboardingTourAbandonment} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import useLearnHowToEvaluateTour, {
  resumeLearnHowToEvaluateTour,
  recordLearnToEvaluateCompletion,
  LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useLearnHowToEvaluateTour';
import HttpClient from '@cdo/apps/util/HttpClient';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn(),
}));

const mockHttpClientPost = HttpClient.post as jest.MockedFunction<
  typeof HttpClient.post
>;

jest.mock('@cdo/apps/sharedComponents/productTour/shepherdTourFactory');
// attachOnboardingAnalytics is stubbed with a minimal fake that wires the
// mocked recordOnboardingTourAbandonment into 'cancel' itself: the real
// attachOnboardingAnalytics calls recordOnboardingTourAbandonment via a
// same-module local reference (a TS/babel compilation artifact), which
// bypasses this jest.mock override entirely, so the real implementation
// would never touch our mock.
jest.mock('@cdo/apps/sharedComponents/productTour/productTourHelpers', () => {
  const recordOnboardingTourAbandonment = jest.fn();
  return {
    ...jest.requireActual(
      '@cdo/apps/sharedComponents/productTour/productTourHelpers'
    ),
    recordOnboardingTourAbandonment,
    attachOnboardingAnalytics: jest.fn(
      (tour: Tour, tourName: string, sessionStorageKey: string) => {
        tour.on('cancel', () =>
          recordOnboardingTourAbandonment(tour, sessionStorageKey, tourName)
        );
      }
    ),
  };
});
jest.mock('@cdo/apps/sharedComponents/productTour/useOnboardingTour', () =>
  jest.fn(({getSteps}: {getSteps: (t: Tour) => unknown}) => {
    const tour = (
      createShepherdTour as jest.MockedFunction<typeof createShepherdTour>
    )({stepClass: ''});
    getSteps(tour);
    return {tour};
  })
);
jest.mock(
  '@cdo/apps/templates/studioHomepages/teacherHomepageV2/learnHowToEvaluateOnboarding',
  () => ({
    ...jest.requireActual(
      '@cdo/apps/templates/studioHomepages/teacherHomepageV2/learnHowToEvaluateOnboarding'
    ),
    createLearnHowToEvaluateProgressSteps: jest.fn(() => []),
    createLearnHowToEvaluateHomepageSteps: jest.fn(() => []),
  })
);
jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  tryGetSessionStorage: jest.fn(),
  trySetSessionStorage: jest.fn(),
}));

const mockCreateShepherdTour = createShepherdTour as jest.MockedFunction<
  typeof createShepherdTour
>;
const mockTryGetSessionStorage = tryGetSessionStorage as jest.MockedFunction<
  typeof tryGetSessionStorage
>;
const mockTrySetSessionStorage = trySetSessionStorage as jest.MockedFunction<
  typeof trySetSessionStorage
>;
const mockRecordTourAbandonment =
  recordOnboardingTourAbandonment as jest.MockedFunction<
    typeof recordOnboardingTourAbandonment
  >;

const makeMockTour = () => {
  const handlers: Record<string, (() => void)[]> = {};
  const steps: {id: string}[] = [];
  return {
    on: jest.fn((event: string, cb: () => void) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(cb);
    }),
    addSteps: jest.fn((s: {id: string}[]) => steps.push(...s)),
    show: jest.fn(),
    steps,
    _handlers: handlers,
    _trigger: (event: string) => handlers[event]?.forEach(cb => cb()),
  } as unknown as Tour & {
    _handlers: Record<string, (() => void)[]>;
    _trigger: (event: string) => void;
  };
};

describe('recordLearnToEvaluateCompletion', () => {
  let sendEventSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHttpClientPost.mockResolvedValue(new Response());
    sendEventSpy = jest
      .spyOn(analyticsReporter, 'sendEvent')
      .mockImplementation(jest.fn());
  });

  it('calls HttpClient.post with correct args', () => {
    recordLearnToEvaluateCompletion();
    expect(mockHttpClientPost).toHaveBeenCalledWith(
      '/dashboardapi/v1/user_product_tours',
      JSON.stringify({tour_name: 'learn_to_evaluate'}),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('sends an ONBOARDING_TOUR_COMPLETED analytics event with the tour name', () => {
    recordLearnToEvaluateCompletion();
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.ONBOARDING_TOUR_COMPLETED,
      {
        tour_name: 'learn_to_evaluate',
      }
    );
  });

  it('does not throw when the backend call fails', async () => {
    mockHttpClientPost.mockRejectedValue(new Error('network error'));
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    recordLearnToEvaluateCompletion();
    await Promise.resolve();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('resumeLearnHowToEvaluateTour', () => {
  let mockTour: ReturnType<typeof makeMockTour>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHttpClientPost.mockResolvedValue(new Response());
    mockTour = makeMockTour();
    mockCreateShepherdTour.mockReturnValue(mockTour as unknown as Tour);
  });

  afterEach(() => {
    Shepherd.activeTour = null;
  });

  it('does nothing when sessionStorage has no step id', () => {
    mockTryGetSessionStorage.mockReturnValue('');
    resumeLearnHowToEvaluateTour();
    expect(mockCreateShepherdTour).not.toHaveBeenCalled();
  });

  it('builds a tour and shows the saved step when sessionStorage has a step id', () => {
    const savedStepId = 'progress-table-step';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});
    mockTryGetSessionStorage.mockReturnValue(savedStepId);

    resumeLearnHowToEvaluateTour();

    expect(mockCreateShepherdTour).toHaveBeenCalled();
    expect(mockTour.show).toHaveBeenCalledWith(savedStepId);
  });

  it('falls back to the first step when the saved step id is not found', () => {
    (mockTour.steps as {id: string}[]).push({id: 'progress-table-step'});
    mockTryGetSessionStorage.mockReturnValue('nonexistent-step');

    resumeLearnHowToEvaluateTour();

    expect(mockTour.show).toHaveBeenCalledWith('progress-table-step');
  });

  it('clears sessionStorage and records completion on complete', () => {
    const savedStepId = 'progress-table-step';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});
    mockTryGetSessionStorage.mockReturnValue(savedStepId);

    resumeLearnHowToEvaluateTour();

    (mockTour as unknown as {_trigger: (event: string) => void})._trigger(
      'complete'
    );

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
      ''
    );
    expect(mockHttpClientPost).toHaveBeenCalledWith(
      '/dashboardapi/v1/user_product_tours',
      JSON.stringify({tour_name: 'learn_to_evaluate'}),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('clears sessionStorage but does not record completion on cancel', () => {
    const savedStepId = 'progress-table-step';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});
    mockTryGetSessionStorage.mockReturnValue(savedStepId);

    resumeLearnHowToEvaluateTour();

    (mockTour as unknown as {_trigger: (event: string) => void})._trigger(
      'cancel'
    );

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
      ''
    );
    expect(mockHttpClientPost).not.toHaveBeenCalled();
  });

  it('reports abandonment before clearing sessionStorage on cancel', () => {
    const savedStepId = 'progress-table-step';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});
    mockTryGetSessionStorage.mockReturnValue(savedStepId);

    resumeLearnHowToEvaluateTour();
    (mockTour as unknown as {_trigger: (event: string) => void})._trigger(
      'cancel'
    );

    expect(mockRecordTourAbandonment).toHaveBeenCalledWith(
      mockTour,
      LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
      'learn_to_evaluate'
    );
    expect(mockRecordTourAbandonment.mock.invocationCallOrder[0]).toBeLessThan(
      mockTrySetSessionStorage.mock.invocationCallOrder[0]
    );
  });

  it('cancels any active Shepherd tour before creating the resumed tour', () => {
    const savedStepId = 'progress-table-step';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});
    mockTryGetSessionStorage.mockReturnValue(savedStepId);

    const cancelMock = jest.fn();
    (Shepherd as unknown as {activeTour: object}).activeTour = {
      cancel: cancelMock,
    };

    resumeLearnHowToEvaluateTour();

    expect(cancelMock).toHaveBeenCalled();
  });
});

describe('useLearnHowToEvaluateTour', () => {
  let mockTour: ReturnType<typeof makeMockTour>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTour = makeMockTour();
    mockCreateShepherdTour.mockReturnValue(mockTour as unknown as Tour);
  });

  it('returns a tour object when demoType is provided', () => {
    const {result} = renderHook(() => useLearnHowToEvaluateTour('high'));
    expect(result.current).toBe(mockTour);
  });

  it('returns a tour object when demoType is null', () => {
    const {result} = renderHook(() => useLearnHowToEvaluateTour(null));
    expect(result.current).toBeDefined();
  });
});
