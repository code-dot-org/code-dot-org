import {
  computeBackoffMs,
  isThrottleError,
  parseRetryAfterMs,
} from '@cdo/apps/aichat/evals/rateLimit';
import {NetworkError} from '@cdo/apps/util/HttpClient';

const networkError = (status: number) =>
  new NetworkError(String(status), {status} as unknown as Response);

describe('isThrottleError', () => {
  it('is true for 429 and 5xx network errors', () => {
    expect(isThrottleError(networkError(429))).toBe(true);
    expect(isThrottleError(networkError(503))).toBe(true);
    expect(isThrottleError(networkError(500))).toBe(true);
  });

  it('is false for non-retryable statuses and non-network errors', () => {
    expect(isThrottleError(networkError(400))).toBe(false);
    expect(isThrottleError(networkError(403))).toBe(false);
    expect(isThrottleError(new Error('boom'))).toBe(false);
    expect(isThrottleError(undefined)).toBe(false);
  });
});

describe('parseRetryAfterMs', () => {
  it('parses delta-seconds', () => {
    expect(parseRetryAfterMs('5')).toBe(5000);
    expect(parseRetryAfterMs('0')).toBe(0);
  });

  it('parses an HTTP-date relative to now', () => {
    const now = Date.parse('Wed, 21 Oct 2026 07:28:00 GMT');
    const future = 'Wed, 21 Oct 2026 07:28:10 GMT';
    expect(parseRetryAfterMs(future, now)).toBe(10000);
  });

  it('returns null for missing/unparseable values', () => {
    expect(parseRetryAfterMs(null)).toBeNull();
    expect(parseRetryAfterMs('not-a-date')).toBeNull();
  });
});

describe('computeBackoffMs', () => {
  it('grows exponentially and is capped, within the jitter band', () => {
    // attempt 0: cap = base = 1000 -> [500, 1000]
    expect(computeBackoffMs(0, 1000, 30000, () => 0)).toBe(500);
    expect(computeBackoffMs(0, 1000, 30000, () => 1)).toBe(1000);
    // attempt 3: cap = 8000 -> [4000, 8000]
    expect(computeBackoffMs(3, 1000, 30000, () => 0)).toBe(4000);
    expect(computeBackoffMs(3, 1000, 30000, () => 1)).toBe(8000);
    // large attempt clamps to maxDelay
    expect(computeBackoffMs(20, 1000, 30000, () => 1)).toBe(30000);
    expect(computeBackoffMs(20, 1000, 30000, () => 0)).toBe(15000);
  });
});
