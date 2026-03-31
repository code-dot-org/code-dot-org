import {v4 as uuidv4} from 'uuid';

const OBSERVABILITY_SESSION_ID_STORAGE_KEY = '__cdo_observability_session_id__';
const SAMPLING_BUCKETS = 10_000_000n;

function generateObservabilitySessionId(): string {
  return uuidv4();
}

export function getOrCreateObservabilitySessionId(): string {
  const existing = sessionStorage.getItem(OBSERVABILITY_SESSION_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const sessionId = generateObservabilitySessionId();
  sessionStorage.setItem(OBSERVABILITY_SESSION_ID_STORAGE_KEY, sessionId);
  return sessionId;
}

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

  const bucket =
    BigInt(`0x${sessionId.replaceAll('-', '')}`) % SAMPLING_BUCKETS;
  const threshold = BigInt(Math.floor(sampleRate * Number(SAMPLING_BUCKETS)));

  return bucket < threshold;
}
