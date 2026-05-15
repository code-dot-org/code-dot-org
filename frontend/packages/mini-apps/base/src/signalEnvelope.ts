/**
 * One parsed signal line from a mini-app's stdout. `key` is the signal
 * name (`MOVE`, `PAINT`, …); `detail` is the optional trailing JSON,
 * decoded but not validated. Each mini-app narrows `detail` to its own
 * signal-payload type.
 */
export interface SignalEnvelope<T = unknown> {
  key: string;
  detail: T | undefined;
}

/**
 * Envelope format: `[TAG] KEY` or `[TAG] KEY {json}`.
 *   - TAG is `\w+` (matches Python's `SignalMessageType.value`, e.g.
 *     `NEIGHBORHOOD`).
 *   - KEY is a single non-whitespace token.
 *   - The trailing JSON object is optional and must be the last thing on
 *     the line.
 */
const ENVELOPE_RE = /^\[(\w+)]\s+(\S+)(?:\s+(\{.*\}))?$/;

/**
 * Parse one stdout line as a mini-app signal envelope. Returns null when
 * the line does not match the envelope format or the captured tag is not
 * `expectedTag`.
 *
 * `expectedTag` is the full bracketed form, e.g. `"[NEIGHBORHOOD]"` —
 * the same string a mini-app exposes via `MiniApp.signalTag`, so callers
 * can pass it through unchanged.
 *
 * Throws if the JSON detail is present but malformed. That is the
 * mini-app's responsibility to avoid emitting; we surface the parse
 * error rather than silently dropping a signal.
 */
export function parseSignalEnvelope<T = unknown>(
  line: string,
  expectedTag: string,
): SignalEnvelope<T> | null {
  const m = line.match(ENVELOPE_RE);
  if (!m) return null;
  if (`[${m[1]}]` !== expectedTag) return null;
  return {
    key: m[2],
    detail: m[3] ? (JSON.parse(m[3]) as T) : undefined,
  };
}
