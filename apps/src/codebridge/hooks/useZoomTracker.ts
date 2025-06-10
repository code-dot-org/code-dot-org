import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import debounce from 'lodash/debounce';
import {useEffect, useRef} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

const DEBOUNCE_TIMEOUT = 1500;

export const useZoomTracker = (appName: string) => {
  const initialDevicePixelRatioRef = useRef(window?.devicePixelRatio || 1);
  const lastZoomValuesRef = useRef<number[]>([
    Math.round(initialDevicePixelRatioRef.current * 100),
    100,
  ]);

  // Returns a list of two zoom percent values:
  // First number is based on window.devicePixelRatio which captures zoom via browser zoom settings
  // or ctrl +/-
  // Second number is based on window.visualViewport.scale which captures zoom via pinch in/out
  // on touchpad/screen.
  const detectZoom = (): number[] => {
    const currentDevicePixelRatio = window.devicePixelRatio || 1;
    // Normalize value so that zoom ratio is normalized to 1.0.
    // The device pixel ratio depends on devices (typical values include 1.0, 1.5, 2.0, etc).
    const zoomDevicePixelRatio =
      currentDevicePixelRatio / initialDevicePixelRatioRef.current;

    const zoomValues = [Math.round(zoomDevicePixelRatio * 100), 100];

    if (window.visualViewport?.scale) {
      zoomValues[1] = Math.round(window.visualViewport.scale * 100);
    }
    return zoomValues;
  };

  useEffect(() => {
    const logZoomChange = (percent: number, direction: 'in' | 'out'): void => {
      const zoomPercent = percent.toString();
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_ZOOM, appName, {
        zoomPercent: zoomPercent,
        direction,
      });
    };

    const checkZoom = () => {
      const currentZoomValues = detectZoom();
      let logged = false;
      // First check device pixel ratio, then visualViewport.
      currentZoomValues.forEach((zoomValue, index) => {
        if (zoomValue !== lastZoomValuesRef.current[index] && !logged) {
          const direction =
            currentZoomValues[0] > lastZoomValuesRef.current[0] ? 'in' : 'out';
          logZoomChange(currentZoomValues[index], direction);
          lastZoomValuesRef.current = currentZoomValues;
          logged = true;
        }
      });
    };

    const debouncedCheckZoom = debounce(checkZoom, DEBOUNCE_TIMEOUT);
    window.visualViewport?.addEventListener('resize', debouncedCheckZoom);

    return () => {
      debouncedCheckZoom.cancel();
      window.visualViewport?.removeEventListener('resize', debouncedCheckZoom);
    };
  }, [appName]);
};
