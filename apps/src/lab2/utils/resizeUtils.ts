import {setIsResizing} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

export const handleResizeStart = (
  dispatch: AppDispatch,
  labType?: string,
  payload?: Record<string, string>
) => {
  logOnResize(labType, payload);
  dispatch(setIsResizing(true));
};

export const handleResizeEnd = (dispatch: AppDispatch) => {
  dispatch(setIsResizing(false));
};

export const logOnResize = (
  labType?: string,
  payload?: Record<string, string>
) => {
  const fullPayload = payload ? {labType, ...payload} : {labType};
  analyticsReporter.sendEvent(
    EVENTS.LAB2_RESIZE_DRAG_START,
    fullPayload,
    PLATFORMS.STATSIG
  );
};
