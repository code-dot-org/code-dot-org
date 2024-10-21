import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import {useCallback} from 'react';

import {
  useFileUploader as useLab2FileUploader,
  analyticsEvents,
} from '@cdo/apps/lab2/hooks';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

export const useFileUploader: Exclude<
  typeof useLab2FileUploader,
  'sendAnalyticsEvent'
> = args => {
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  const sendAnalyticsEvent = useCallback(
    (eventName: string, payload: Record<string, string>) => {
      console.log('SAE : ', eventName, payload);
      switch (eventName) {
        case analyticsEvents.UPLOAD_FAILED: {
          sendCodebridgeAnalyticsEvent(
            EVENTS.CODEBRIDGE_UPLOAD_UNACCEPTED_FILE,
            appName,
            payload
          );
          return;
        }
        case analyticsEvents.UPLOAD_UNACCEPTED_FILE: {
          sendCodebridgeAnalyticsEvent(
            EVENTS.CODEBRIDGE_UPLOAD_FAILED,
            appName,
            payload
          );
        }
      }
    },
    [appName]
  );

  return useLab2FileUploader({sendAnalyticsEvent, ...args});
};
