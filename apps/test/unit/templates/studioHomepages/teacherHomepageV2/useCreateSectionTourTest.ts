import Shepherd, {Tour} from 'shepherd.js';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {recordOnboardingTourAbandonment} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import {
  resumeCreateSectionOnboardingTour,
  recordTourCompletion,
  CREATE_SECTION_ONBOARDING_STEP_KEY,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useCreateSectionTour';
import HttpClient from '@cdo/apps/util/HttpClient';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn(),
}));

const mockHttpClientPost = HttpClient.post as jest.MockedFunction<
  typeof HttpClient.post
>;

jest.mock('@cdo/apps/sharedComponents/productTour/shepherdTourFactory');
jest.mock('@cdo/apps/sharedComponents/productTour/productTourHelpers', () => ({
  ...jest.requireActual(
    '@cdo/apps/sharedComponents/productTour/productTourHelpers'
  ),
  recordOnboardingTourAbandonment: jest.fn(),
}));
jest.mock(
  '@cdo/apps/templates/studioHomepages/teacherHomepageV2/createSectionOnboarding',
  () => ({
    createHomepageSteps: jest.fn(() => []),
    createSectionsNewSteps: jest.fn(() => []),
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

describe('recordTourCompletion', () => {
  let sendEventSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    sendEventSpy = jest
      .spyOn(analyticsReporter, 'sendEvent')
      .mockImplementation(jest.fn());
  });

  it('calls HttpClient.post with correct args', () => {
    mockHttpClientPost.mockResolvedValue(new Response());

    recordTourCompletion();

    expect(mockHttpClientPost).toHaveBeenCalledWith(
      '/dashboardapi/v1/user_product_tours',
      JSON.stringify({tour_name: 'create_class_section'}),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('sends an ONBOARDING_TOUR_COMPLETED analytics event with the tour name', () => {
    mockHttpClientPost.mockResolvedValue(new Response());

    recordTourCompletion();

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.ONBOARDING_TOUR_COMPLETED,
      {
        tour_name: 'create_class_section',
      }
    );
  });

  it('does not throw when the backend call fails', async () => {
    mockHttpClientPost.mockRejectedValue(new Error('network error'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    recordTourCompletion();

    await Promise.resolve();
    expect(console.error).toHaveBeenCalled();
  });
});

describe('resumeCreateSectionOnboardingTour', () => {
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
    resumeCreateSectionOnboardingTour();
    expect(mockCreateShepherdTour).not.toHaveBeenCalled();
  });

  it('builds a tour and shows the saved step', () => {
    const savedStepId = 'name-section';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});
    mockTryGetSessionStorage.mockReturnValue(savedStepId);

    resumeCreateSectionOnboardingTour();

    expect(mockCreateShepherdTour).toHaveBeenCalled();
    expect(mockTour.show).toHaveBeenCalledWith(savedStepId);
  });

  it('falls back to the first step when the saved step id is not found', () => {
    (mockTour.steps as {id: string}[]).push({id: 'name-section'});
    mockTryGetSessionStorage.mockReturnValue('nonexistent-step');

    resumeCreateSectionOnboardingTour();

    expect(mockTour.show).toHaveBeenCalledWith('name-section');
  });

  it('cancels any active Shepherd tour before creating the resumed tour', () => {
    const savedStepId = 'name-section';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});
    mockTryGetSessionStorage.mockReturnValue(savedStepId);

    const cancelMock = jest.fn();
    (Shepherd as unknown as {activeTour: object}).activeTour = {
      cancel: cancelMock,
    };

    resumeCreateSectionOnboardingTour();

    expect(cancelMock).toHaveBeenCalled();
  });

  it('does not cancel the active tour when there is no saved step', () => {
    mockTryGetSessionStorage.mockReturnValue('');

    const cancelMock = jest.fn();
    (Shepherd as unknown as {activeTour: object}).activeTour = {
      cancel: cancelMock,
    };

    resumeCreateSectionOnboardingTour();

    expect(cancelMock).not.toHaveBeenCalled();
    expect(mockCreateShepherdTour).not.toHaveBeenCalled();
  });

  it('clears sessionStorage and records completion on complete', () => {
    const savedStepId = 'name-section';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});
    mockTryGetSessionStorage.mockReturnValue(savedStepId);

    resumeCreateSectionOnboardingTour();
    (mockTour as unknown as {_trigger: (event: string) => void})._trigger(
      'complete'
    );

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      CREATE_SECTION_ONBOARDING_STEP_KEY,
      ''
    );
    expect(mockHttpClientPost).toHaveBeenCalledWith(
      '/dashboardapi/v1/user_product_tours',
      JSON.stringify({tour_name: 'create_class_section'}),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('clears sessionStorage but does not record completion on cancel', () => {
    const savedStepId = 'name-section';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});
    mockTryGetSessionStorage.mockReturnValue(savedStepId);

    resumeCreateSectionOnboardingTour();
    (mockTour as unknown as {_trigger: (event: string) => void})._trigger(
      'cancel'
    );

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      CREATE_SECTION_ONBOARDING_STEP_KEY,
      ''
    );
    expect(mockHttpClientPost).not.toHaveBeenCalled();
  });

  it('reports abandonment before clearing sessionStorage on cancel', () => {
    const savedStepId = 'name-section';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});
    mockTryGetSessionStorage.mockReturnValue(savedStepId);

    resumeCreateSectionOnboardingTour();
    (mockTour as unknown as {_trigger: (event: string) => void})._trigger(
      'cancel'
    );

    expect(mockRecordTourAbandonment).toHaveBeenCalledWith(
      mockTour,
      CREATE_SECTION_ONBOARDING_STEP_KEY,
      'create_class_section'
    );
    expect(mockRecordTourAbandonment.mock.invocationCallOrder[0]).toBeLessThan(
      mockTrySetSessionStorage.mock.invocationCallOrder[0]
    );
  });
});
