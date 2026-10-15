import * as Observability from '@code-dot-org/core/plugins/observability';

import {NetworkError} from '@cdo/apps/util/HttpClient';

// One metric for every outcome, so alert rules can divide errors by the total.
const REQUEST_METRIC = 'ai-gateway.request';

/**
 * The key Rails signed the request's token with, as Rails reported it.
 * `not_reported` means no Rails response named one: the token request failed
 * before Rails answered, or its answer could not be read.
 */
export type SigningKey =
  | 'environment_key'
  | 'legacy_shared_key'
  | 'not_reported';

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

export function parseSigningKey(value: unknown): SigningKey {
  return value === 'environment_key' || value === 'legacy_shared_key'
    ? value
    : 'not_reported';
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

function count(signingKey: SigningKey, outcome: GatewayRequestOutcome) {
  Observability.metrics.count(REQUEST_METRIC, 1, {
    signing_key: signingKey,
    outcome,
  });
}

export function recordGatewayRequestOk(signingKey: SigningKey): void {
  count(signingKey, 'ok');
}

// Rails names in its error body the key it meant to sign with.
export async function recordTokenNotIssued(error: unknown): Promise<void> {
  const body = await errorBody(error);
  count(parseSigningKey(body.signingKey), 'token_not_issued');
}

export async function recordGatewayRequestError(
  signingKey: SigningKey,
  error: unknown
): Promise<void> {
  const body = await errorBody(error);
  const status = error instanceof NetworkError ? error.response.status : 0;
  if (status === 401 && body.reason !== 'turnstile') {
    count(signingKey, 'token_rejected');
  } else if (status >= 500) {
    count(signingKey, 'gateway_error');
  } else {
    count(signingKey, 'other_error');
  }
}
