// Dimensions and log details reach Sentry and CloudWatch unscrubbed: no
// student text, no user ids.

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {MetricDimension} from '@cdo/apps/metrics/types';

import {adaptivePathwayId} from './metricsHelpers';

// Each combination of values is a separate CloudWatch metric, so keep these few.
type Dimensions = {[name: string]: string | number | undefined};

const reporter = () => Lab2Registry.getInstance().getMetricsReporter();

const toDimensions = (dimensions: Dimensions): MetricDimension[] =>
  Object.entries(dimensions)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => ({name, value: String(value)}));

// 0 when no response came back.
export const httpStatus = (error: unknown): number =>
  (error as {response?: {status?: number}} | undefined)?.response?.status ?? 0;

export function countAdaptive(name: string, dimensions: Dimensions = {}) {
  reporter().incrementCounter(name, toDimensions(dimensions));
}

export function timeAdaptive(
  name: string,
  milliseconds: number,
  dimensions: Dimensions = {}
) {
  reporter().publishMetric(
    name,
    milliseconds,
    'Milliseconds',
    toDimensions(dimensions)
  );
}

export function reportAdaptiveError(
  message: string,
  error: unknown,
  details: Record<string, unknown> = {}
) {
  reporter().logError(message, error instanceof Error ? error : undefined, {
    error: String(error),
    pathwayId: adaptivePathwayId(),
    ...details,
  });
}
