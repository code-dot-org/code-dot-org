jest.mock('@code-dot-org/core/plugins/observability', () => ({
  metrics: {count: jest.fn()},
  recordError: jest.fn(),
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
const recordErrorMock = Observability.recordError as jest.Mock;

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
  recordErrorMock.mockClear();
});

describe('parseSigningKey', () => {
  it('keeps the two keys Rails reports', () => {
    expect(parseSigningKey('environment_key')).toBe('environment_key');
    expect(parseSigningKey('legacy_shared_key')).toBe('legacy_shared_key');
    expect(recordErrorMock).not.toHaveBeenCalled();
  });

  it('reports anything else as an error and names no key', () => {
    expect(parseSigningKey(undefined)).toBeUndefined();
    expect(parseSigningKey('production')).toBeUndefined();
    expect(recordErrorMock).toHaveBeenCalledTimes(2);
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
  it('counts token_not_issued without a signing key', () => {
    recordTokenNotIssued();

    expect(lastTags()).toEqual({outcome: 'token_not_issued'});
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

  it('counts without a signing key when the token response named none', async () => {
    await recordGatewayRequestError(
      undefined,
      networkError(500, {error: 'Unknown Error'})
    );

    expect(lastTags()).toEqual({outcome: 'gateway_error'});
  });

  it('counts anything else as other_error', async () => {
    await recordGatewayRequestError(
      'environment_key',
      networkError(429, {error: 'Too Many Requests'})
    );

    expect(lastTags().outcome).toBe('other_error');
  });
});
