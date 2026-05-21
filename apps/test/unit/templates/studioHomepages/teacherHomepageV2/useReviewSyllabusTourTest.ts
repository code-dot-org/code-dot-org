import {renderHook} from '@testing-library/react-hooks';
import {Tour} from 'shepherd.js';

import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import useReviewSyllabusTour, {
  resumeReviewSyllabusOnboardingTour,
  REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useReviewSyllabusTour';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

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

describe('resumeReviewSyllabusOnboardingTour', () => {
  let mockTour: ReturnType<typeof makeMockTour>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTour = makeMockTour();
    mockCreateShepherdTour.mockReturnValue(mockTour as unknown as Tour);
  });

  it('does nothing when no step ID is saved in sessionStorage', () => {
    mockTryGetSessionStorage.mockReturnValue('');
    resumeReviewSyllabusOnboardingTour();
    expect(mockCreateShepherdTour).not.toHaveBeenCalled();
  });

  it('does nothing when step ID is present but demoType is missing', () => {
    mockTryGetSessionStorage
      .mockReturnValueOnce('unit-breadcrumb-step') // step key
      .mockReturnValueOnce(''); // demo type key
    resumeReviewSyllabusOnboardingTour();
    expect(mockCreateShepherdTour).not.toHaveBeenCalled();
  });

  it('builds a tour and shows the saved step when both keys are present', () => {
    const savedStepId = 'unit-breadcrumb-step';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});

    mockTryGetSessionStorage
      .mockReturnValueOnce(savedStepId)
      .mockReturnValueOnce('high');

    resumeReviewSyllabusOnboardingTour();

    expect(mockCreateShepherdTour).toHaveBeenCalled();
    expect(mockTour.show).toHaveBeenCalledWith(savedStepId);
  });

  it('falls back to the first step when the saved step ID is not found', () => {
    (mockTour.steps as {id: string}[]).push({id: 'unit-breadcrumb-step'});

    mockTryGetSessionStorage
      .mockReturnValueOnce('nonexistent-step-id')
      .mockReturnValueOnce('high');

    resumeReviewSyllabusOnboardingTour();

    expect(mockTour.show).toHaveBeenCalledWith('unit-breadcrumb-step');
  });

  it('clears the step key from sessionStorage on complete', () => {
    const savedStepId = 'unit-breadcrumb-step';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});

    mockTryGetSessionStorage
      .mockReturnValueOnce(savedStepId)
      .mockReturnValueOnce('high');

    resumeReviewSyllabusOnboardingTour();

    // Mock handling the "complete" event
    const handlers = (
      mockTour as unknown as {_handlers: Record<string, () => void>}
    )._handlers;
    handlers['complete']();

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      ''
    );
  });

  it('clears the step key from sessionStorage on cancel', () => {
    const savedStepId = 'unit-breadcrumb-step';
    (mockTour.steps as {id: string}[]).push({id: savedStepId});

    mockTryGetSessionStorage
      .mockReturnValueOnce(savedStepId)
      .mockReturnValueOnce('high');

    resumeReviewSyllabusOnboardingTour();

    // mock handling the cancel event
    const handlers = (
      mockTour as unknown as {_handlers: Record<string, () => void>}
    )._handlers;
    handlers['cancel']();

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      ''
    );
  });
});

describe('useReviewSyllabusTour', () => {
  let mockTour: ReturnType<typeof makeMockTour>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTour = makeMockTour();
    mockCreateShepherdTour.mockReturnValue(mockTour as unknown as Tour);
  });

  it('returns a tour object', () => {
    const {result} = renderHook(() => useReviewSyllabusTour('high'));
    expect(result.current).toBe(mockTour);
  });

  it('saves demoType to sessionStorage on mount', () => {
    renderHook(() => useReviewSyllabusTour('high'));
    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      'reviewSyllabusOnboardingDemoType',
      'high'
    );
  });

  it('does not write to sessionStorage when demoType is null', () => {
    renderHook(() => useReviewSyllabusTour(null));
    expect(mockTrySetSessionStorage).not.toHaveBeenCalledWith(
      'reviewSyllabusOnboardingDemoType',
      expect.anything()
    );
  });
});
