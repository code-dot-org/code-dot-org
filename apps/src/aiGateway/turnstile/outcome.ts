import * as Observability from '@code-dot-org/core/plugins/observability';

import {
  isTurnstileChallengeError,
  type TokenAcquisitionMode,
  type TurnstileFailureReason,
} from './types';

// Sentry alert rules divide a filtered series by an unfiltered one, so success
// and failure share a metric name and are separated by the `result` attribute.
const OUTCOME_METRIC = 'ai-gateway.turnstile';
const DURATION_METRIC = 'ai-gateway.turnstile.duration_ms';

export const classifyTurnstileFailure = (
  error: unknown
): TurnstileFailureReason =>
  isTurnstileChallengeError(error) ? error.reason : 'unknown';

interface TurnstileOutcome {
  mode: TokenAcquisitionMode;
  durationMs: number;
  error?: unknown;
}

export function recordTurnstileOutcome({
  mode,
  durationMs,
  error,
}: TurnstileOutcome): void {
  const failed = error !== undefined;
  const result = failed ? 'error' : 'ok';
  const reason = failed ? classifyTurnstileFailure(error) : undefined;

  Observability.metrics.count(OUTCOME_METRIC, 1, {
    mode,
    result,
    ...(reason && {reason}),
  });

  Observability.metrics.distribution(DURATION_METRIC, Math.round(durationMs), {
    mode,
    result,
  });

  if (failed) {
    Observability.logger.error('turnstile challenge failed', {
      feature: 'ai-gateway',
      mode,
      reason,
      durationMs: Math.round(durationMs),
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
}
