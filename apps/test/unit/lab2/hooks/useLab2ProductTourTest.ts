import {renderHook} from '@testing-library/react-hooks';
import {Tour} from 'shepherd.js';

import useHideTourOnTourChange from '@cdo/apps/lab2/hooks/useHideTourOnTourChange';
import useLab2ProductTour from '@cdo/apps/lab2/hooks/useLab2ProductTour';
import {
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import useProductTour from '@cdo/apps/sharedComponents/productTour/useProductTour';

jest.mock('@cdo/apps/sharedComponents/productTour/useProductTour');
jest.mock('@cdo/apps/lab2/hooks/useHideTourOnTourChange');
jest.mock('@cdo/apps/lab2/projects/utils');

const mockUseProductTour = useProductTour as jest.MockedFunction<
  typeof useProductTour
>;
const mockUseHideTourOnTourChange =
  useHideTourOnTourChange as jest.MockedFunction<
    typeof useHideTourOnTourChange
  >;
const mockGetIsStartMode = getIsStartMode as jest.MockedFunction<
  typeof getIsStartMode
>;
const mockGetAppOptionsViewingExemplar =
  getAppOptionsViewingExemplar as jest.MockedFunction<
    typeof getAppOptionsViewingExemplar
  >;
const mockGetAppOptionsEditingExemplar =
  getAppOptionsEditingExemplar as jest.MockedFunction<
    typeof getAppOptionsEditingExemplar
  >;

const mockTour = {
  start: jest.fn(),
  cancel: jest.fn(),
  hide: jest.fn(),
} as unknown as Tour;

const defaultProps = {
  getSteps: jest.fn().mockReturnValue([]),
  localStorageKey: 'test-tour-seen',
  tourAvailable: true,
};

describe('useLab2ProductTour', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetIsStartMode.mockReturnValue(false);
    mockGetAppOptionsViewingExemplar.mockReturnValue(undefined);
    mockGetAppOptionsEditingExemplar.mockReturnValue(undefined);
    mockUseProductTour.mockReturnValue({tour: mockTour});
    mockUseHideTourOnTourChange.mockReturnValue(undefined);
  });

  it('returns the tour from useProductTour', () => {
    const {result} = renderHook(() => useLab2ProductTour(defaultProps));
    expect(result.current.tour).toBe(mockTour);
  });

  it('passes tourAvailable through to useProductTour when no restrictions apply', () => {
    renderHook(() =>
      useLab2ProductTour({...defaultProps, tourAvailable: true})
    );
    expect(mockUseProductTour).toHaveBeenCalledWith(
      expect.objectContaining({tourAvailable: true})
    );
  });

  it('hides tour when in start mode', () => {
    mockGetIsStartMode.mockReturnValue(true);
    renderHook(() => useLab2ProductTour(defaultProps));
    expect(mockUseProductTour).toHaveBeenCalledWith(
      expect.objectContaining({tourAvailable: false})
    );
  });

  it('hides tour when viewing exemplar', () => {
    mockGetAppOptionsViewingExemplar.mockReturnValue(true);
    renderHook(() => useLab2ProductTour(defaultProps));
    expect(mockUseProductTour).toHaveBeenCalledWith(
      expect.objectContaining({tourAvailable: false})
    );
  });

  it('hides tour when editing exemplar', () => {
    mockGetAppOptionsEditingExemplar.mockReturnValue(true);
    renderHook(() => useLab2ProductTour(defaultProps));
    expect(mockUseProductTour).toHaveBeenCalledWith(
      expect.objectContaining({tourAvailable: false})
    );
  });

  it('hides tour when tourAvailable prop is false', () => {
    renderHook(() =>
      useLab2ProductTour({...defaultProps, tourAvailable: false})
    );
    expect(mockUseProductTour).toHaveBeenCalledWith(
      expect.objectContaining({tourAvailable: false})
    );
  });

  it('calls useHideTourOnTourChange with the tour', () => {
    renderHook(() => useLab2ProductTour(defaultProps));
    expect(mockUseHideTourOnTourChange).toHaveBeenCalledWith(mockTour);
  });

  it('calls useHideTourOnTourChange with null when useProductTour returns null', () => {
    mockUseProductTour.mockReturnValue({tour: null});
    renderHook(() => useLab2ProductTour(defaultProps));
    expect(mockUseHideTourOnTourChange).toHaveBeenCalledWith(null);
  });

  it('passes through all other useProductTour props', () => {
    const onStart = jest.fn();
    const onComplete = jest.fn();
    const onCancel = jest.fn();
    renderHook(() =>
      useLab2ProductTour({...defaultProps, onStart, onComplete, onCancel})
    );
    expect(mockUseProductTour).toHaveBeenCalledWith(
      expect.objectContaining({onStart, onComplete, onCancel})
    );
  });
});
