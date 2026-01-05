import {EVENTS, analyticsReporter} from '@code-dot-org/metrics';

export const logOnResize = (
  labType?: string,
  payload?: Record<string, string>,
) => {
  const partialPayload: Record<string, string> =
    labType !== undefined ? {labType} : {};
  const fullPayload =
    payload !== undefined ? {...partialPayload, ...payload} : partialPayload;
  analyticsReporter.sendEvent(EVENTS.LAB2_RESIZE_DRAG_START, fullPayload);
};
