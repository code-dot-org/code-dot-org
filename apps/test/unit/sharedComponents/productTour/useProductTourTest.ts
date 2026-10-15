import {renderHook} from '@testing-library/react-hooks';
import {Tour} from 'shepherd.js';

import {createTourWithSteps} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import useProductTour from '@cdo/apps/sharedComponents/productTour/useProductTour';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

jest.mock('@cdo/apps/sharedComponents/productTour/productTourHelpers');
jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  tryGetLocalStorage: jest.fn(),
  trySetLocalStorage: jest.fn(),
}));

const mockCreateTourWithSteps = createTourWithSteps as jest.MockedFunction<
  typeof createTourWithSteps
>;
const mockTryGetLocalStorage = tryGetLocalStorage as jest.MockedFunction<
  typeof tryGetLocalStorage
>;
const mockTrySetLocalStorage = trySetLocalStorage as jest.MockedFunction<
  typeof trySetLocalStorage
>;

const LOCAL_STORAGE_KEY = 'test-tour-seen';

const defaultProps = {
  getSteps: jest.fn().mockReturnValue([]),
  localStorageKey: LOCAL_STORAGE_KEY,
  tourAvailable: true,
};

describe('useProductTour', () => {
  let eventHandlers: Record<string, () => void>;
  let mockTour: Tour;

  beforeEach(() => {
    jest.clearAllMocks();
    eventHandlers = {};
    mockTour = {
      on: jest.fn((event: string, cb: () => void) => {
        eventHandlers[event] = cb;
      }),
      currentStep: null,
      steps: [],
    } as unknown as Tour;
    mockCreateTourWithSteps.mockReturnValue(mockTour);
    mockTryGetLocalStorage.mockReturnValue('no');
  });

  it('returns a tour when available and not yet seen', () => {
    const {result} = renderHook(() => useProductTour(defaultProps));
    expect(result.current.tour).toBe(mockTour);
  });

  it('returns null when the tour has already been seen', () => {
    mockTryGetLocalStorage.mockReturnValue('yes');
    const {result} = renderHook(() => useProductTour(defaultProps));
    expect(result.current.tour).toBeNull();
  });

  it('marks the tour seen on show', () => {
    renderHook(() => useProductTour(defaultProps));
    eventHandlers['show']();
    expect(mockTrySetLocalStorage).toHaveBeenCalledWith(
      LOCAL_STORAGE_KEY,
      'yes'
    );
  });

  it('does not mark the tour seen on start', () => {
    renderHook(() => useProductTour(defaultProps));
    eventHandlers['start']();
    expect(mockTrySetLocalStorage).not.toHaveBeenCalled();
  });

  it('does not mark the tour seen on complete', () => {
    const onComplete = jest.fn();
    renderHook(() => useProductTour({...defaultProps, onComplete}));
    eventHandlers['complete']();
    expect(mockTrySetLocalStorage).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('does not mark the tour seen on cancel', () => {
    const onCancel = jest.fn();
    renderHook(() => useProductTour({...defaultProps, onCancel}));
    eventHandlers['cancel']();
    expect(mockTrySetLocalStorage).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledWith(0);
  });
});
