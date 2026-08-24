import * as Observability from '@code-dot-org/core/plugins/observability';

import {
  isTurnstileChallengeError,
  type TokenAcquisitionMode,
  type TurnstileFailureReason,
} from './types';

// One metric name for both outcomes so alert rules can divide error by total.
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
