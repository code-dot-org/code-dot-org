import {renderHook} from '@testing-library/react-hooks';
import {Tour} from 'shepherd.js';

import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import useOnboardingTour from '@cdo/apps/sharedComponents/productTour/useOnboardingTour';
import {trySetSessionStorage} from '@cdo/apps/utils';

jest.mock('@cdo/apps/sharedComponents/productTour/shepherdTourFactory');
jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  trySetSessionStorage: jest.fn(),
}));

const mockCreateShepherdTour = createShepherdTour as jest.MockedFunction<
  typeof createShepherdTour
>;
const mockTrySetSessionStorage = trySetSessionStorage as jest.MockedFunction<
  typeof trySetSessionStorage
>;

const SESSION_KEY = 'test-onboarding-step';

const defaultProps = {
  getSteps: jest.fn().mockReturnValue([]),
  sessionStorageKey: SESSION_KEY,
};

describe('useOnboardingTour', () => {
  let eventHandlers: Record<string, () => void>;
  let mockTour: Tour;

  beforeEach(() => {
    jest.clearAllMocks();
    eventHandlers = {};
    mockTour = {
      on: jest.fn((event: string, cb: () => void) => {
        eventHandlers[event] = cb;
      }),
      addSteps: jest.fn(),
      currentStep: null,
    } as unknown as Tour;
    mockCreateShepherdTour.mockReturnValue(mockTour);
  });

  it('returns a tour', () => {
    const {result} = renderHook(() => useOnboardingTour(defaultProps));
    expect(result.current.tour).toBe(mockTour);
  });

  it('calls getSteps with the tour and adds the steps', () => {
    const mockSteps = [{id: 'step-1'}];
    const getSteps = jest.fn().mockReturnValue(mockSteps);
    renderHook(() => useOnboardingTour({...defaultProps, getSteps}));
    expect(getSteps).toHaveBeenCalledWith(mockTour);
    expect(mockTour.addSteps).toHaveBeenCalledWith(mockSteps);
  });

  it('saves the current step id to sessionStorage on show', () => {
    renderHook(() => useOnboardingTour(defaultProps));
    (mockTour as unknown as {currentStep: {id: string}}).currentStep = {
      id: 'step-1',
    };
    eventHandlers['show']();
    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      SESSION_KEY,
      'step-1'
    );
  });

  it('does not save to sessionStorage on show when there is no current step', () => {
    renderHook(() => useOnboardingTour(defaultProps));
    eventHandlers['show']();
    expect(mockTrySetSessionStorage).not.toHaveBeenCalled();
  });

  it('clears sessionStorage and calls onComplete on complete', () => {
    const onComplete = jest.fn();
    renderHook(() => useOnboardingTour({...defaultProps, onComplete}));
    eventHandlers['complete']();
    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(SESSION_KEY, '');
    expect(onComplete).toHaveBeenCalled();
  });

  it('clears sessionStorage on complete without an onComplete callback', () => {
    renderHook(() => useOnboardingTour(defaultProps));
    eventHandlers['complete']();
    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(SESSION_KEY, '');
  });

  it('clears sessionStorage on cancel', () => {
    renderHook(() => useOnboardingTour(defaultProps));
    eventHandlers['cancel']();
    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(SESSION_KEY, '');
  });
});
