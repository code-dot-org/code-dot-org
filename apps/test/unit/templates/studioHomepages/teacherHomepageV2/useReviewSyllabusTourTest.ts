import {renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import Shepherd, {Tour} from 'shepherd.js';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import {COURSE_HEADER_STEP_ID} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/reviewSyllabusOnboarding';
import useReviewSyllabusTour, {
  resumeReviewSyllabusOnboardingTour,
  recordViewSyllabusCompletion,
  REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useReviewSyllabusTour';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn(),
}));

const mockHttpClientPost = HttpClient.post as jest.MockedFunction<
  typeof HttpClient.post
>;

jest.mock('@cdo/apps/sharedComponents/productTour/shepherdTourFactory');
jest.mock('@cdo/apps/sharedComponents/productTour/useOnboardingTour', () =>
  jest.fn(({getSteps}: {getSteps: (t: Tour) => unknown}) => {
    const tour = (
      createShepherdTour as jest.MockedFunction<typeof createShepherdTour>
    )({stepClass: ''});
    getSteps(tour);
    return {tour};
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

const makeMockTour = () => {
  const handlers: Record<string, () => void> = {};
  const steps: {id: string}[] = [];
  return {
    on: jest.fn((event: string, cb: () => void) => {
      handlers[event] = cb;
    }),
    addSteps: jest.fn((s: {id: string}[]) => steps.push(...s)),
    show: jest.fn(),
    steps,
    _handlers: handlers,
  } as unknown as Tour;
};

describe('recordViewSyllabusCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHttpClientPost.mockResolvedValue(new Response());
  });

  it('calls HttpClient.post with correct args', () => {
    recordViewSyllabusCompletion();
    expect(mockHttpClientPost).toHaveBeenCalledWith(
      '/dashboardapi/v1/user_product_tours',
      JSON.stringify({tour_name: 'view_syllabus'}),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('does not throw when the backend call fails', async () => {
    mockHttpClientPost.mockRejectedValue(new Error('network error'));
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    recordViewSyllabusCompletion();
    await Promise.resolve();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('resumeReviewSyllabusOnboardingTour', () => {
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

  it('does nothing when no step ID is saved in sessionStorage', () => {
    mockTryGetSessionStorage.mockReturnValue('');
    resumeReviewSyllabusOnboardingTour();
    expect(mockCreateShepherdTour).not.toHaveBeenCalled();
  });

  it('does nothing when step ID is present but demoType is missing', () => {
    mockTryGetSessionStorage
      .mockReturnValueOnce(COURSE_HEADER_STEP_ID) // step key
      .mockReturnValueOnce(''); // demo type key
    resumeReviewSyllabusOnboardingTour();
    expect(mockCreateShepherdTour).not.toHaveBeenCalled();
  });

  it('clears the step key and does not show when no steps are built for the demoType', () => {
    mockTryGetSessionStorage
      .mockReturnValueOnce(COURSE_HEADER_STEP_ID)
      .mockReturnValueOnce('unknown' as 'high'); // unrecognized demoType — hits default case, returns []

    resumeReviewSyllabusOnboardingTour();

    expect(mockTour.show).not.toHaveBeenCalled();
    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      ''
    );
  });

  it('builds a tour and shows the saved step when both keys are present', () => {
    const savedStepId = COURSE_HEADER_STEP_ID;
    (mockTour.steps as {id: string}[]).push({id: savedStepId});

    mockTryGetSessionStorage
      .mockReturnValueOnce(savedStepId)
      .mockReturnValueOnce('high');

    resumeReviewSyllabusOnboardingTour();

    expect(mockCreateShepherdTour).toHaveBeenCalled();
    expect(mockTour.show).toHaveBeenCalledWith(savedStepId);
  });

  it('falls back to the first step when the saved step ID is not found', () => {
    (mockTour.steps as {id: string}[]).push({id: COURSE_HEADER_STEP_ID});

    mockTryGetSessionStorage
      .mockReturnValueOnce('nonexistent-step-id')
      .mockReturnValueOnce('high');

    resumeReviewSyllabusOnboardingTour();

    expect(mockTour.show).toHaveBeenCalledWith(COURSE_HEADER_STEP_ID);
  });

  it('clears sessionStorage and records completion on complete', () => {
    const savedStepId = COURSE_HEADER_STEP_ID;
    (mockTour.steps as {id: string}[]).push({id: savedStepId});

    mockTryGetSessionStorage
      .mockReturnValueOnce(savedStepId)
      .mockReturnValueOnce('high');

    resumeReviewSyllabusOnboardingTour();

    const handlers = (
      mockTour as unknown as {_handlers: Record<string, () => void>}
    )._handlers;
    handlers['complete']();

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      ''
    );
    expect(mockHttpClientPost).toHaveBeenCalledWith(
      '/dashboardapi/v1/user_product_tours',
      JSON.stringify({tour_name: 'view_syllabus'}),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('clears sessionStorage but does not record completion on cancel', () => {
    const savedStepId = COURSE_HEADER_STEP_ID;
    (mockTour.steps as {id: string}[]).push({id: savedStepId});

    mockTryGetSessionStorage
      .mockReturnValueOnce(savedStepId)
      .mockReturnValueOnce('high');

    resumeReviewSyllabusOnboardingTour();

    const handlers = (
      mockTour as unknown as {_handlers: Record<string, () => void>}
    )._handlers;
    handlers['cancel']();

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      ''
    );
    expect(mockHttpClientPost).not.toHaveBeenCalled();
  });

  it('cancels any active Shepherd tour before creating the resumed tour', () => {
    const savedStepId = COURSE_HEADER_STEP_ID;
    (mockTour.steps as {id: string}[]).push({id: savedStepId});

    mockTryGetSessionStorage
      .mockReturnValueOnce(savedStepId)
      .mockReturnValueOnce('high');

    const cancelMock = jest.fn();
    (Shepherd as unknown as {activeTour: object}).activeTour = {
      cancel: cancelMock,
    };

    resumeReviewSyllabusOnboardingTour();

    expect(cancelMock).toHaveBeenCalled();
  });
});

describe('useReviewSyllabusTour', () => {
  let mockTour: ReturnType<typeof makeMockTour>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTour = makeMockTour();
    mockCreateShepherdTour.mockReturnValue(mockTour as unknown as Tour);
    stubRedux();
    registerReducers({teacherSections});
  });

  afterEach(() => {
    restoreRedux();
  });

  const makeWrapper =
    () =>
    ({children}: {children: React.ReactNode}) =>
      React.createElement(
        Provider as React.ComponentType<{store: ReturnType<typeof getStore>}>,
        {store: getStore()},
        children
      );

  it('returns a tour object', () => {
    const {result} = renderHook(() => useReviewSyllabusTour('high'), {
      wrapper: makeWrapper(),
    });
    expect(result.current).toBe(mockTour);
  });

  it('saves demoType to sessionStorage on mount', () => {
    renderHook(() => useReviewSyllabusTour('high'), {
      wrapper: makeWrapper(),
    });
    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      'reviewSyllabusOnboardingDemoType',
      'high'
    );
  });

  it('clears the demoType key from sessionStorage when demoType is null', () => {
    renderHook(() => useReviewSyllabusTour(null), {wrapper: makeWrapper()});
    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      'reviewSyllabusOnboardingDemoType',
      ''
    );
  });
});
