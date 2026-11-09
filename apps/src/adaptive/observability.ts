// Tags and context reach Sentry unscrubbed: no student text, no user ids.

import * as Observability from '@code-dot-org/core/plugins/observability';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {adaptivePathwayId} from './metricsHelpers';

type Tags = {[key: string]: string | number | boolean | undefined};

function commonTags(tags: Tags): Record<string, string | number | boolean> {
  const defined = Object.fromEntries(
    Object.entries(tags).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean>;
  const pathwayId = adaptivePathwayId();
  return {lab: 'adaptive', ...(pathwayId && {pathwayId}), ...defined};
}

export function countAdaptive(name: string, tags: Tags = {}) {
  Observability.metrics.count(name, 1, commonTags(tags));
}

export function distributeAdaptive(name: string, value: number, tags: Tags) {
  Observability.metrics.distribution(name, value, commonTags(tags));
}

/**
 * One Sentry issue per message, with what was thrown as its cause. Also
 * logged, which reaches CloudWatch even with Sentry off.
 */
export function reportAdaptiveError(
  message: string,
  error: unknown,
  {
    context = {},
    tags = {},
  }: {context?: Record<string, unknown>; tags?: Tags} = {}
) {
  Lab2Registry.getInstance()
    .getMetricsReporter()
    .logError(message, error instanceof Error ? error : undefined, {
      error: String(error),
      ...context,
    });
  Observability.recordError(
    Object.assign(new Error(message), {cause: error}),
    context,
    commonTags(tags)
  );
}
