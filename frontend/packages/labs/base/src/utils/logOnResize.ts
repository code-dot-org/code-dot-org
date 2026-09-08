import {metrics} from '@code-dot-org/core/plugins/observability';

export const logOnResize = (
  labType?: string,
  payload?: Record<string, string>,
) => {
  const partialPayload: Record<string, string> =
    labType !== undefined ? {labType} : {};
  const fullPayload =
    payload !== undefined ? {...partialPayload, ...payload} : partialPayload;
  metrics.count('Resize bar dragged in lab2', 1, fullPayload);
};
