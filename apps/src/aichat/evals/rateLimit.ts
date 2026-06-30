import {isNetworkError} from '@cdo/apps/util/HttpClient';

/**
 * Client-side rate limiting / backpressure for the image-safety eval.
 *
 * The eval drives the shared production AI gateway and the Azure moderation
 * endpoint. A large CSV is thousands of calls, so we must (a) not error-storm
 * when throttled and (b) not starve real traffic. The strategy:
 *
 *   - bounded concurrency (handled by the runner's worker pool), plus
 *   - retry with exponential backoff + jitter on throttle/transient errors,
 *     honoring a Retry-After header when present, where a throttle extends a
 *     SHARED cooldown so every in-flight worker backs off together.
 */

// Statuses we treat as "slow down and retry" rather than hard failures.
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export const DEFAULT_MAX_RETRIES = 4;
const DEFAULT_BASE_DELAY_MS = 1000;
const DEFAULT_MAX_DELAY_MS = 30000;

export interface ThrottleEvent {
  // How long the shared cooldown was extended by, in ms.
  waitMs: number;
  // Consecutive throttles since the last success (drives the backoff).
  consecutive: number;
  // HTTP status that triggered the throttle, if known.
  status?: number;
}

export interface RateControllerOptions {
  baseDelayMs?: number;
  maxDelayMs?: number;
  // Minimum gap between successive request starts (proactive spacing). 0 = off.
  minIntervalMs?: number;
  onThrottle?: (event: ThrottleEvent) => void;
  onResume?: () => void;
}

// True for errors worth retrying with backoff (server throttle/transient).
export function isThrottleError(error: unknown): boolean {
  return isNetworkError(error) && RETRYABLE_STATUS.has(error.response.status);
}

// Parse a Retry-After header value (delta-seconds or HTTP-date) into ms from
// now, or null when absent/unparseable.
export function parseRetryAfterMs(
  value: string | null,
  nowMs: number = Date.now()
): number | null {
  if (!value) {
    return null;
  }
  const seconds = Number(value);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }
  const dateMs = Date.parse(value);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - nowMs);
  }
  return null;
}

function retryAfterMsFromError(error: unknown): number | null {
  if (!isNetworkError(error)) {
    return null;
  }
  return parseRetryAfterMs(error.response.headers?.get('Retry-After') ?? null);
}

// Exponential backoff with "equal jitter": half fixed, half random, capped.
// Result is in [cap/2, cap] where cap = min(maxDelay, base * 2^attempt).
export function computeBackoffMs(
  attempt: number,
  baseDelayMs: number = DEFAULT_BASE_DELAY_MS,
  maxDelayMs: number = DEFAULT_MAX_DELAY_MS,
  rand: () => number = Math.random
): number {
  const cap = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
  return Math.round(cap / 2 + rand() * (cap / 2));
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, {once: true});
  });
}

/**
 * Shared pacing state for one eval run. A single instance is shared across all
 * workers so that a throttle on any request cools down the entire run.
 */
export class RateController {
  private cooldownUntil = 0;
  private nextSlot = 0;
  private consecutiveThrottles = 0;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly minIntervalMs: number;
  private readonly onThrottle?: (event: ThrottleEvent) => void;
  private readonly onResume?: () => void;

  constructor(options: RateControllerOptions = {}) {
    this.baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
    this.maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
    this.minIntervalMs = options.minIntervalMs ?? 0;
    this.onThrottle = options.onThrottle;
    this.onResume = options.onResume;
  }

  // Block until this worker is allowed to start its next request: past any
  // shared cooldown and respecting the minimum inter-request spacing.
  async acquire(signal?: AbortSignal): Promise<void> {
    const now = Date.now();
    let startAt = Math.max(now, this.cooldownUntil);
    if (this.minIntervalMs > 0) {
      startAt = Math.max(startAt, this.nextSlot);
      this.nextSlot = startAt + this.minIntervalMs;
    }
    const wait = startAt - now;
    if (wait > 0) {
      await sleep(wait, signal);
    }
  }

  // Record a throttle: extend the shared cooldown and report it.
  noteThrottle(
    status: number | undefined,
    retryAfterMs: number | null
  ): number {
    this.consecutiveThrottles += 1;
    const backoff = computeBackoffMs(
      this.consecutiveThrottles - 1,
      this.baseDelayMs,
      this.maxDelayMs
    );
    const waitMs = Math.max(retryAfterMs ?? 0, backoff);
    this.cooldownUntil = Math.max(this.cooldownUntil, Date.now() + waitMs);
    this.onThrottle?.({
      waitMs,
      consecutive: this.consecutiveThrottles,
      status,
    });
    return waitMs;
  }

  // Record a success: clears the throttle streak (and signals resume once).
  noteSuccess(): void {
    if (this.consecutiveThrottles > 0) {
      this.consecutiveThrottles = 0;
      this.onResume?.();
    }
  }
}

/**
 * Run an async request through the shared rate controller, retrying
 * throttle/transient errors with backoff. Non-retryable errors propagate.
 */
export async function runWithThrottle<T>(
  fn: () => Promise<T>,
  rc: RateController,
  maxRetries: number = DEFAULT_MAX_RETRIES,
  signal?: AbortSignal
): Promise<T> {
  let attempt = 0;
  for (;;) {
    await rc.acquire(signal);
    try {
      const result = await fn();
      rc.noteSuccess();
      return result;
    } catch (error) {
      if (isThrottleError(error) && attempt < maxRetries) {
        attempt += 1;
        const status = isNetworkError(error)
          ? error.response.status
          : undefined;
        // Extends the shared cooldown; the next acquire() waits it out.
        rc.noteThrottle(status, retryAfterMsFromError(error));
        continue;
      }
      throw error;
    }
  }
}
