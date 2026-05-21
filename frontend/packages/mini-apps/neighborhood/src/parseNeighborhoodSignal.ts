import {parseSignalEnvelope} from '@code-dot-org/mini-app-base';

import {NEIGHBORHOOD_SIGNAL_TAG} from './constants';
import type {NeighborhoodSignal, NeighborhoodSignalType} from './types';

type NeighborhoodSignalDetail = NonNullable<NeighborhoodSignal['detail']>;

/**
 * Parse one stdout line as a Neighborhood signal. Returns null when the
 * line is not a `[NEIGHBORHOOD]`-tagged envelope; callers can log a
 * metric on null to catch malformed emitters.
 *
 * Throws on a present-but-malformed JSON detail — that is a bug in the
 * Python-side emitter, not a recoverable case, and surfacing it loudly
 * helps catch protocol drift.
 */
export function parseNeighborhoodSignal(
  line: string,
): NeighborhoodSignal | null {
  const envelope = parseSignalEnvelope<NeighborhoodSignalDetail>(
    line,
    NEIGHBORHOOD_SIGNAL_TAG,
  );
  if (!envelope) return null;
  return {
    value: envelope.key as NeighborhoodSignalType,
    detail: envelope.detail,
  };
}
