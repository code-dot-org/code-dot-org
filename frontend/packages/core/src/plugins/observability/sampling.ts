import {v4 as uuidv4} from 'uuid';

const OBSERVABILITY_SESSION_ID_STORAGE_KEY = '__cdo_observability_session_id__';
const SAMPLING_BUCKETS = 10_000_000n;

/**
 * Generate the per-tab session identifier used for deterministic sampling.
 * @returns A new UUID for the current browser tab.
 */
function generateObservabilitySessionId(): string {
  return uuidv4();
}

/**
 * Replace a corrupted or user-modified session identifier with a fresh value.
 * @returns The replacement session identifier written to sessionStorage.
 */
function resetObservabilitySessionId(): string {
  const sessionId = generateObservabilitySessionId();
  sessionStorage.setItem(OBSERVABILITY_SESSION_ID_STORAGE_KEY, sessionId);
  return sessionId;
}

/**
 * Read the existing per-tab session identifier, creating one if necessary.
 * @returns The existing or newly-created per-tab session identifier.
 */
export function getOrCreateObservabilitySessionId(): string {
  const existing = sessionStorage.getItem(OBSERVABILITY_SESSION_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const sessionId = generateObservabilitySessionId();
  sessionStorage.setItem(OBSERVABILITY_SESSION_ID_STORAGE_KEY, sessionId);
  return sessionId;
}

/**
 * Deterministically decide whether a signal should be sampled for this tab.
 * The UUID-derived bucket keeps the result stable for the lifetime of the tab.
 * @param sessionId Per-tab session identifier used for stable bucketing.
 * @param sampleRate Decimal sample rate between `0` and `1`.
 * @returns `true` when the signal should be sampled for this tab.
 */
export function isSampled(
  sessionId: string | undefined,
  sampleRate = 0,
): boolean {
  if (!sessionId || sampleRate <= 0) {
    return false;
  }

  if (sampleRate >= 1) {
    return true;
  }

  let normalizedSessionId = sessionId;
  let bucket: bigint;

  try {
    bucket =
      BigInt(`0x${normalizedSessionId.replaceAll('-', '')}`) % SAMPLING_BUCKETS;
  } catch {
    // Recover gracefully if sessionStorage was manually edited or corrupted.
    normalizedSessionId = resetObservabilitySessionId();
    bucket =
      BigInt(`0x${normalizedSessionId.replaceAll('-', '')}`) % SAMPLING_BUCKETS;
  }

  const threshold = BigInt(Math.floor(sampleRate * Number(SAMPLING_BUCKETS)));

  return bucket < threshold;
}
