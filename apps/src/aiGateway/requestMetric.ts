import * as Observability from '@code-dot-org/core/plugins/observability';

import {NetworkError} from '@cdo/apps/util/HttpClient';

// One metric for every outcome, so alert rules can divide errors by the total.
const REQUEST_METRIC = 'ai-gateway.request';

/** The key Rails signed a token with, as its token response reported. */
export type SigningKey = 'environment_key' | 'legacy_shared_key';

/**
 * - `ok`: the gateway returned a response.
 * - `token_not_issued`: Rails returned an error instead of a token.
 * - `token_rejected`: the gateway refused the token (401 that is not a Turnstile failure).
 * - `gateway_error`: the gateway accepted the token but returned a server error (5xx).
 * - `other_error`: anything else, such as a rate limit, a Turnstile failure or a network failure.
 */
export type GatewayRequestOutcome =
  | 'ok'
  | 'token_not_issued'
  | 'token_rejected'
  | 'gateway_error'
  | 'other_error';

// Rails and this code ship together, so any other value is a bug.
export function parseSigningKey(value: unknown): SigningKey | undefined {
  if (value === 'environment_key' || value === 'legacy_shared_key') {
    return value;
  }
  Observability.recordError(
    new Error('AI Gateway token response has no recognized signingKey'),
    {signingKey: value},
    {feature: 'ai-gateway'}
  );
  return undefined;
}

async function errorBody(error: unknown): Promise<Record<string, unknown>> {
  if (!(error instanceof NetworkError)) {
    return {};
  }
  try {
    const body = await error.response.clone().json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}

function count(outcome: GatewayRequestOutcome, signingKey?: SigningKey) {
  Observability.metrics.count(REQUEST_METRIC, 1, {
    outcome,
    ...(signingKey && {signing_key: signingKey}),
  });
}

// No token exists, so there is no key to label it with.
export function recordTokenNotIssued(): void {
  count('token_not_issued');
}

export function recordGatewayRequestOk(
  signingKey: SigningKey | undefined
): void {
  count('ok', signingKey);
}

export async function recordGatewayRequestError(
  signingKey: SigningKey | undefined,
  error: unknown
): Promise<void> {
  const body = await errorBody(error);
  const status = error instanceof NetworkError ? error.response.status : 0;
  if (status === 401 && body.reason !== 'turnstile') {
    count('token_rejected', signingKey);
  } else if (status >= 500) {
    count('gateway_error', signingKey);
  } else {
    count('other_error', signingKey);
  }
}
