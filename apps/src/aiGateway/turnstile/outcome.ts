import * as Observability from '@code-dot-org/core/plugins/observability';

import {type TurnstileMode} from './mode';
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
  /** Whether a caller was waiting on this challenge. */
  acquisition: TokenAcquisitionMode;
  /** Enforcement policy in force when the challenge started. */
  enforcement: TurnstileMode;
  durationMs: number;
  error?: unknown;
}

export function recordTurnstileOutcome({
  acquisition,
  enforcement,
  durationMs,
  error,
}: TurnstileOutcome): void {
  const failed = error !== undefined;
  const result = failed ? 'error' : 'ok';
  const reason = failed ? classifyTurnstileFailure(error) : undefined;

  // `mode` carries the enforcement policy, matching the worker's
  // turnstile.mode attribute, so a query means the same thing on both sides of
  // the request. Without it a failure is ambiguous: under `monitor` the
  // request still succeeds and the number is the measurement the rollout
  // depends on, while under `enforce` the same failure is a broken request.
  Observability.metrics.count(OUTCOME_METRIC, 1, {
    acquisition,
    mode: enforcement,
    result,
    ...(reason && {reason}),
  });

  Observability.metrics.distribution(DURATION_METRIC, Math.round(durationMs), {
    acquisition,
    mode: enforcement,
    result,
  });

  if (failed) {
    // Under `monitor` a failed challenge is tolerated by design -- the request
    // proceeds without a token and the worker accepts it. Logging that at
    // error level would fill the error stream during exactly the phase we are
    // deliberately measuring.
    const log =
      enforcement === 'monitor'
        ? Observability.logger.warn
        : Observability.logger.error;

    log('turnstile challenge failed', {
      feature: 'ai-gateway',
      acquisition,
      mode: enforcement,
      reason,
      durationMs: Math.round(durationMs),
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
}
