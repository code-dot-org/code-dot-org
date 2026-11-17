import * as Observability from '@code-dot-org/core/plugins/observability';

import {timeoutMsFromDcdoSeconds} from '@cdo/apps/util/dcdoTimeout';

import {type TurnstileEnforcementMode} from '../turnstile/enforcementMode';

import {
  DEFAULT_RECAPTCHA_TIMEOUT_SECONDS,
  LOG,
  RECAPTCHA_ACTION,
  RECAPTCHA_SITE_KEY,
  RECAPTCHA_TIMEOUT_FLAG,
} from './constants';
import {loadRecaptchaScript} from './loadScript';
import {isRecaptchaError, RecaptchaError} from './types';

export {isRecaptchaError, RecaptchaError} from './types';

const OUTCOME_METRIC = 'ai-gateway.recaptcha';
const DURATION_METRIC = 'ai-gateway.recaptcha.duration_ms';

function executeRecaptcha(): Promise<string> {
  const timeoutMs = timeoutMsFromDcdoSeconds(
    RECAPTCHA_TIMEOUT_FLAG,
    DEFAULT_RECAPTCHA_TIMEOUT_SECONDS
  );
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () =>
        reject(
          new RecaptchaError(
            'timeout',
            `reCAPTCHA did not answer within ${timeoutMs}ms`
          )
        ),
      timeoutMs
    );
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) {
      clearTimeout(timeout);
      reject(
        new RecaptchaError(
          'execute_failed',
          'reCAPTCHA script loaded without defining grecaptcha'
        )
      );
      return;
    }
    grecaptcha.ready(() => {
      grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: RECAPTCHA_ACTION}).then(
        token => {
          clearTimeout(timeout);
          if (token) {
            resolve(token);
          } else {
            reject(
              new RecaptchaError('empty_token', 'reCAPTCHA returned no token')
            );
          }
        },
        (error: unknown) => {
          clearTimeout(timeout);
          reject(
            new RecaptchaError('execute_failed', 'reCAPTCHA execute() failed', {
              cause: error,
            })
          );
        }
      );
    });
  });
}

function recordRecaptchaOutcome(
  enforcementMode: TurnstileEnforcementMode,
  durationMs: number,
  error?: unknown
): void {
  const result = error === undefined ? 'ok' : 'error';
  let reason: string | undefined;
  if (error !== undefined) {
    reason = isRecaptchaError(error) ? error.reason : 'unknown';
  }

  Observability.metrics.count(OUTCOME_METRIC, 1, {
    enforcement_mode: enforcementMode,
    result,
    ...(reason && {reason}),
  });
  Observability.metrics.distribution(DURATION_METRIC, Math.round(durationMs), {
    enforcement_mode: enforcementMode,
    result,
  });

  if (error !== undefined) {
    Observability.logger.warn('recaptcha fallback failed', {
      feature: 'ai-gateway',
      enforcement_mode: enforcementMode,
      reason,
      durationMs: Math.round(durationMs),
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Obtains a reCAPTCHA v3 token for one gateway request. Tokens expire after
 * two minutes and are single use, so none is fetched ahead of time.
 */
export async function getRecaptchaToken(
  enforcementMode: TurnstileEnforcementMode
): Promise<string> {
  const start = performance.now();
  try {
    await loadRecaptchaScript();
    const token = await executeRecaptcha();
    console.log(`${LOG} Token delivered (len=${token.length})`);
    recordRecaptchaOutcome(enforcementMode, performance.now() - start);
    return token;
  } catch (error) {
    console.error(`${LOG} Token acquisition failed:`, error);
    recordRecaptchaOutcome(enforcementMode, performance.now() - start, error);
    throw error;
  }
}
