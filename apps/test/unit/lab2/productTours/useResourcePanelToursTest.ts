import {act, renderHook} from '@testing-library/react-hooks';

import useLab2ProductTour from '@cdo/apps/lab2/hooks/useLab2ProductTour';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProductTour} from '@cdo/apps/lab2/productTours/productToursPerLab';
import useResourcePanelTours from '@cdo/apps/lab2/productTours/useResourcePanelTours';
import {LifecycleEvent, sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME,
  RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
  RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {tryGetLocalStorage} from '@cdo/apps/utils';

jest.mock('@cdo/apps/lab2/hooks/useLab2ProductTour');
jest.mock('@cdo/apps/lab2/hooks/useLifecycleNotifier');
jest.mock('@cdo/apps/lab2/utils', () => ({
  ...jest.requireActual('@cdo/apps/lab2/utils'),
  sendLab2AnalyticsEvent: jest.fn(),
}));
jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  tryGetLocalStorage: jest.fn().mockReturnValue('no'),
}));

const mockUseLab2ProductTour = useLab2ProductTour as jest.MockedFunction<
  typeof useLab2ProductTour
>;
const mockUseLifecycleNotifier = useLifecycleNotifier as jest.Mock;
const mockSendLab2AnalyticsEvent =
  sendLab2AnalyticsEvent as jest.MockedFunction<typeof sendLab2AnalyticsEvent>;
const mockTryGetLocalStorage = tryGetLocalStorage as jest.MockedFunction<
  typeof tryGetLocalStorage
>;

const mockValidationSettings = {
  onValidate: jest.fn(),
  onStopValidation: jest.fn(),
  isValidating: false,
  isValidateDisabled: false,
};

const defaultParams = {
  appName: 'pythonlab',
  productToursForLevel: [
    ProductTour.ResourcePanelOnboarding,
    ProductTour.ResourcePanelValidation,
  ],
  isStandaloneCollapsed: false,
  hasValidationConditions: true,
  validationSettings: mockValidationSettings,
};

describe('useResourcePanelTours', () => {
  // Capture lifecycle callbacks so we can trigger them in tests.
  let lifecycleHandlers: Partial<
    Record<LifecycleEvent, (...args: unknown[]) => void>
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    Lab2Registry.create();
    lifecycleHandlers = {};
    mockUseLifecycleNotifier.mockImplementation(
      (event: LifecycleEvent, callback: (...args: unknown[]) => void) => {
        lifecycleHandlers[event] = callback;
      }
    );
    mockUseLab2ProductTour.mockReturnValue({tour: null});
    mockTryGetLocalStorage.mockReturnValue('no');
  });

  describe('onboarding tour availability', () => {
    it('enables the onboarding tour when all conditions are met', () => {
      renderHook(() => useResourcePanelTours(defaultParams));

      const onboardingCall = mockUseLab2ProductTour.mock.calls[0][0];
      expect(onboardingCall.tourAvailable).toBe(true);
    });

    it('disables the onboarding tour when isStandaloneCollapsed is true', () => {
      renderHook(() =>
        useResourcePanelTours({
          ...defaultParams,
          isStandaloneCollapsed: true,
        })
      );

      const onboardingCall = mockUseLab2ProductTour.mock.calls[0][0];
      expect(onboardingCall.tourAvailable).toBe(false);
    });

    it('disables the onboarding tour when the tour is not in productToursForLevel', () => {
      renderHook(() =>
        useResourcePanelTours({
          ...defaultParams,
          productToursForLevel: [],
        })
      );

      const onboardingCall = mockUseLab2ProductTour.mock.calls[0][0];
      expect(onboardingCall.tourAvailable).toBe(false);
    });

    it('disables the onboarding tour when appName is not configured for the tour', () => {
      renderHook(() =>
        useResourcePanelTours({
          ...defaultParams,
          appName: 'music',
        })
      );

      const onboardingCall = mockUseLab2ProductTour.mock.calls[0][0];
      expect(onboardingCall.tourAvailable).toBe(false);
    });

    it('disables the onboarding tour while level is loading', () => {
      const {rerender} = renderHook(() => useResourcePanelTours(defaultParams));

      act(() => {
        lifecycleHandlers[LifecycleEvent.LevelLoadStarted]?.(1);
      });
      rerender();

      // The second batch of calls after rerender is what we care about.
      const lastOnboardingCall =
        mockUseLab2ProductTour.mock.calls[
          mockUseLab2ProductTour.mock.calls.length - 2
        ][0];
      expect(lastOnboardingCall.tourAvailable).toBe(false);
    });

    it('re-enables the onboarding tour after level load completes', () => {
      const {rerender} = renderHook(() => useResourcePanelTours(defaultParams));

      act(() => {
        lifecycleHandlers[LifecycleEvent.LevelLoadStarted]?.(1);
      });
      rerender();

      act(() => {
        lifecycleHandlers[LifecycleEvent.LevelLoadCompleted]?.();
      });
      rerender();

      const lastOnboardingCall =
        mockUseLab2ProductTour.mock.calls[
          mockUseLab2ProductTour.mock.calls.length - 2
        ][0];
      expect(lastOnboardingCall.tourAvailable).toBe(true);
    });
  });

  describe('validation tour availability', () => {
    it('enables the validation tour when all conditions are met and onboarding is not pending', () => {
      // Mark onboarding tour as seen so it does not block validation tour.
      mockTryGetLocalStorage.mockImplementation((key: string) =>
        key === RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN ? 'yes' : 'no'
      );

      renderHook(() => useResourcePanelTours(defaultParams));

      const validationCall = mockUseLab2ProductTour.mock.calls[1][0];
      expect(validationCall.tourAvailable).toBe(true);
    });

    it('enables the validation tour when onboarding tour is not enabled or seen', () => {
      renderHook(() =>
        useResourcePanelTours({
          ...defaultParams,
          productToursForLevel: ['resource_panel_validation'], // Onboarding tour not in productTours, so not enabled.
        })
      );

      const validationCall = mockUseLab2ProductTour.mock.calls[1][0];
      expect(validationCall.tourAvailable).toBe(true);
    });

    it('disables the validation tour when onboarding tour is enabled but not yet seen', () => {
      // Onboarding not seen — both tours enabled on level, so validation is blocked.
      renderHook(() => useResourcePanelTours(defaultParams));

      const validationCall = mockUseLab2ProductTour.mock.calls[1][0];
      expect(validationCall.tourAvailable).toBe(false);
    });

    it('disables the validation tour when hasValidationConditions is false', () => {
      mockTryGetLocalStorage.mockImplementation((key: string) =>
        key === RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN ? 'yes' : 'no'
      );

      renderHook(() =>
        useResourcePanelTours({
          ...defaultParams,
          hasValidationConditions: false,
        })
      );

      const validationCall = mockUseLab2ProductTour.mock.calls[1][0];
      expect(validationCall.tourAvailable).toBe(false);
    });

    it('disables the validation tour when validationSettings is undefined', () => {
      mockTryGetLocalStorage.mockImplementation((key: string) =>
        key === RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN ? 'yes' : 'no'
      );

      renderHook(() =>
        useResourcePanelTours({
          ...defaultParams,
          validationSettings: undefined,
        })
      );

      const validationCall = mockUseLab2ProductTour.mock.calls[1][0];
      expect(validationCall.tourAvailable).toBe(false);
    });

    it('disables the validation tour while level is loading', () => {
      mockTryGetLocalStorage.mockImplementation((key: string) =>
        key === RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN ? 'yes' : 'no'
      );

      const {rerender} = renderHook(() => useResourcePanelTours(defaultParams));

      act(() => {
        lifecycleHandlers[LifecycleEvent.LevelLoadStarted]?.(1);
      });
      rerender();

      const lastValidationCall =
        mockUseLab2ProductTour.mock.calls[
          mockUseLab2ProductTour.mock.calls.length - 1
        ][0];
      expect(lastValidationCall.tourAvailable).toBe(false);
    });

    it('disables the validation tour when the tour is not in productToursForLevel', () => {
      mockTryGetLocalStorage.mockImplementation((key: string) =>
        key === RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN ? 'yes' : 'no'
      );

      renderHook(() =>
        useResourcePanelTours({
          ...defaultParams,
          productToursForLevel: ['resource_panel_onboarding'],
        })
      );

      const validationCall = mockUseLab2ProductTour.mock.calls[1][0];
      expect(validationCall.tourAvailable).toBe(false);
    });
  });

  describe('analytics callbacks', () => {
    it('sends INTRO_FLOW_STARTED event with the onboarding flow name on tour start', () => {
      renderHook(() => useResourcePanelTours(defaultParams));

      const {onStart} = mockUseLab2ProductTour.mock.calls[0][0];
      onStart?.();

      expect(mockSendLab2AnalyticsEvent).toHaveBeenCalledWith(
        EVENTS.INTRO_FLOW_STARTED,
        {flowName: RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME}
      );
    });

    it('sends INTRO_FLOW_COMPLETED event with the onboarding flow name on tour complete', () => {
      renderHook(() => useResourcePanelTours(defaultParams));

      const {onComplete} = mockUseLab2ProductTour.mock.calls[0][0];
      act(() => {
        onComplete?.();
      });

      expect(mockSendLab2AnalyticsEvent).toHaveBeenCalledWith(
        EVENTS.INTRO_FLOW_COMPLETED,
        {flowName: RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME}
      );
    });

    it('sends INTRO_FLOW_EXIT event with the onboarding flow name and step on tour cancel', () => {
      renderHook(() => useResourcePanelTours(defaultParams));

      const {onCancel} = mockUseLab2ProductTour.mock.calls[0][0];
      act(() => {
        onCancel?.(2);
      });

      expect(mockSendLab2AnalyticsEvent).toHaveBeenCalledWith(
        EVENTS.INTRO_FLOW_EXIT,
        {flowName: RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME, step: '2'}
      );
    });

    it('sends INTRO_FLOW_STARTED event with the validation flow name on validation tour start', () => {
      renderHook(() => useResourcePanelTours(defaultParams));

      const {onStart} = mockUseLab2ProductTour.mock.calls[1][0];
      onStart?.();

      expect(mockSendLab2AnalyticsEvent).toHaveBeenCalledWith(
        EVENTS.INTRO_FLOW_STARTED,
        {flowName: RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME}
      );
    });
  });

  describe('onboarding tour seen state', () => {
    it('unblocks the validation tour after onboarding tour is completed', () => {
      // Start with onboarding tour not seen.
      mockTryGetLocalStorage.mockReturnValue('no');

      const {rerender} = renderHook(() => useResourcePanelTours(defaultParams));

      // Validation is initially blocked by onboarding.
      expect(mockUseLab2ProductTour.mock.calls[1][0].tourAvailable).toBe(false);

      // Complete the onboarding tour.
      const {onComplete} = mockUseLab2ProductTour.mock.calls[0][0];
      act(() => {
        onComplete?.();
      });
      rerender();

      const lastValidationCall =
        mockUseLab2ProductTour.mock.calls[
          mockUseLab2ProductTour.mock.calls.length - 1
        ][0];
      expect(lastValidationCall.tourAvailable).toBe(true);
    });

    it('unblocks the validation tour after onboarding tour is cancelled', () => {
      mockTryGetLocalStorage.mockReturnValue('no');

      const {rerender} = renderHook(() => useResourcePanelTours(defaultParams));

      expect(mockUseLab2ProductTour.mock.calls[1][0].tourAvailable).toBe(false);

      const {onCancel} = mockUseLab2ProductTour.mock.calls[0][0];
      act(() => {
        onCancel?.(0);
      });
      rerender();

      const lastValidationCall =
        mockUseLab2ProductTour.mock.calls[
          mockUseLab2ProductTour.mock.calls.length - 1
        ][0];
      expect(lastValidationCall.tourAvailable).toBe(true);
    });
  });
});
