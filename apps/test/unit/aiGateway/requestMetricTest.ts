jest.mock('@code-dot-org/core/plugins/observability', () => ({
  metrics: {count: jest.fn()},
}));

import * as Observability from '@code-dot-org/core/plugins/observability';

import {
  parseSigningKey,
  recordGatewayRequestError,
  recordGatewayRequestOk,
  recordTokenNotIssued,
} from '@cdo/apps/aiGateway/requestMetric';
import {NetworkError} from '@cdo/apps/util/HttpClient';

const countMock = Observability.metrics.count as jest.Mock;

function networkError(status: number, body: unknown): NetworkError {
  return new NetworkError(
    `status ${status}`,
    new Response(JSON.stringify(body), {status})
  );
}

function lastTags() {
  expect(countMock).toHaveBeenCalledTimes(1);
  const [name, value, tags] = countMock.mock.calls[0];
  expect(name).toBe('ai-gateway.request');
  expect(value).toBe(1);
  return tags;
}

beforeEach(() => {
  countMock.mockClear();
});

describe('parseSigningKey', () => {
  it('keeps the two keys Rails reports', () => {
    expect(parseSigningKey('environment_key')).toBe('environment_key');
    expect(parseSigningKey('legacy_shared_key')).toBe('legacy_shared_key');
  });

  it('reports anything else as not_reported', () => {
    expect(parseSigningKey(undefined)).toBe('not_reported');
    expect(parseSigningKey('production')).toBe('not_reported');
  });
});

describe('recordGatewayRequestOk', () => {
  it('counts an ok request under its signing key', () => {
    recordGatewayRequestOk('environment_key');

    expect(lastTags()).toEqual({
      signing_key: 'environment_key',
      outcome: 'ok',
    });
  });
});

describe('recordTokenNotIssued', () => {
  it('takes the signing key from the Rails error body', async () => {
    await recordTokenNotIssued(
      networkError(500, {signingKey: 'environment_key'})
    );

    expect(lastTags()).toEqual({
      signing_key: 'environment_key',
      outcome: 'token_not_issued',
    });
  });

  it('reports not_reported when Rails gave no readable answer', async () => {
    await recordTokenNotIssued(new Error('network down'));

    expect(lastTags()).toEqual({
      signing_key: 'not_reported',
      outcome: 'token_not_issued',
    });
  });
});

describe('recordGatewayRequestError', () => {
  it('counts a 401 for the token as token_rejected', async () => {
    await recordGatewayRequestError(
      'environment_key',
      networkError(401, {reason: 'invalid_token'})
    );

    expect(lastTags().outcome).toBe('token_rejected');
  });

  it('does not count a Turnstile 401 as token_rejected', async () => {
    await recordGatewayRequestError(
      'environment_key',
      networkError(401, {reason: 'turnstile'})
    );

    expect(lastTags().outcome).toBe('other_error');
  });

  it('counts a 5xx as gateway_error', async () => {
    await recordGatewayRequestError(
      'legacy_shared_key',
      networkError(500, {error: 'Unknown Error'})
    );

    expect(lastTags()).toEqual({
      signing_key: 'legacy_shared_key',
      outcome: 'gateway_error',
    });
  });

  it('counts anything else as other_error', async () => {
    await recordGatewayRequestError(
      'environment_key',
      networkError(429, {error: 'Too Many Requests'})
    );

    expect(lastTags().outcome).toBe('other_error');
  });
});
