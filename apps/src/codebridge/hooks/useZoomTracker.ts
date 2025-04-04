import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import debounce from 'lodash/debounce';
import {useEffect, useRef} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

const DEBOUNCE_TIMEOUT = 300;

export const useZoomTracker = (appName: string) => {
  const initialDPRRef = useRef(window?.devicePixelRatio || 1);
  const lastZoomValuesRef = useRef<number[]>([
    Math.round(initialDPRRef.current * 100),
    100,
  ]);

  const detectZoom = (): number[] => {
    const currentDPR = window.devicePixelRatio || 1;
    const zoomDPR = currentDPR / initialDPRRef.current;
    const zoomValues = [Math.round(zoomDPR * 100), 100];
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
        levelPath: window.location.pathname,
      });
    };

    const checkZoom = () => {
      const currentZoomValues = detectZoom();
      let logged = false;
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
