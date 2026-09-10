import * as Observability from '@code-dot-org/core/plugins/observability';

import {type TurnstileEnforcementMode} from './enforcementMode';
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
  acquisitionMode: TokenAcquisitionMode;
  /** Enforcement policy in force when the challenge started. */
  enforcementMode: TurnstileEnforcementMode;
  durationMs: number;
  error?: unknown;
}

export function recordTurnstileOutcome({
  acquisitionMode,
  enforcementMode,
  durationMs,
  error,
}: TurnstileOutcome): void {
  const failed = error !== undefined;
  const result = failed ? 'error' : 'ok';
  const reason = failed ? classifyTurnstileFailure(error) : undefined;

  // Both axes are named for what they are. Neither is called `mode`: the
  // acquisition mode and the enforcement mode are both legitimately "the
  // turnstile mode", so the bare word cannot identify either one.
  //
  // Enforcement has to be on the series because without it a failure is
  // ambiguous: under `monitor` the request still succeeds and the count is the
  // measurement the rollout depends on, while under `enforce` the same failure
  // is a broken request.
  Observability.metrics.count(OUTCOME_METRIC, 1, {
    acquisition_mode: acquisitionMode,
    enforcement_mode: enforcementMode,
    result,
    ...(reason && {reason}),
  });

  Observability.metrics.distribution(DURATION_METRIC, Math.round(durationMs), {
    acquisition_mode: acquisitionMode,
    enforcement_mode: enforcementMode,
    result,
  });

  if (failed) {
    // Under `monitor` a failed challenge is tolerated by design -- the request
    // proceeds without a token and the worker accepts it. Logging that at
    // error level would fill the error stream during exactly the phase we are
    // deliberately measuring.
    const log =
      enforcementMode === 'monitor'
        ? Observability.logger.warn
        : Observability.logger.error;

    log('turnstile challenge failed', {
      feature: 'ai-gateway',
      acquisition_mode: acquisitionMode,
      enforcement_mode: enforcementMode,
      reason,
      durationMs: Math.round(durationMs),
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
}
