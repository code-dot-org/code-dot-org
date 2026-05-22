import {metrics} from '@code-dot-org/core/plugins/observability';

import {isDevMode} from './devMode';

/**
 * Telemetry event names owned by the notebook lab.
 * The `nblab.` prefix namespaces them away from other labs sharing the same
 * observability backend.
 */
export type NotebookLabEvent =
  | 'nblab.import.attempt'
  | 'nblab.import.success'
  | 'nblab.import.failure'
  | 'nblab.artifact.shared'
  | 'nblab.quota.exceeded'
  | 'nblab.runtime.worker_crashed'
  | 'nblab.runtime.interrupt'
  | 'nblab.session.created'
  | 'nblab.session.signed_out';

/**
 * Regex patterns for payload keys that must never reach the telemetry backend.
 * Matched case-insensitively against each key.
 */
const FORBIDDEN_KEY_PATTERNS: RegExp[] = [
  /^sessionlabel$/i,
  /^session_label$/i,
  /^cellsource$/i,
  /^cell_source$/i,
  /^learnerurl$/i,
  /^learner_url$/i,
  /api[_-]?key/i,
];

/**
 * Returns true when a key+value pair must not be forwarded to telemetry.
 * Covers both structural key patterns and the `url`=`http*` heuristic.
 * @param key Payload property name.
 * @param value Payload property value.
 */
function isForbidden(key: string, value: unknown): boolean {
  for (const pattern of FORBIDDEN_KEY_PATTERNS) {
    if (pattern.test(key)) {
      return true;
    }
  }
  // Strip bare URL values — they can carry session-scoped identifiers.
  if (/^url$/i.test(key) && typeof value === 'string' && value.startsWith('http')) {
    return true;
  }
  return false;
}

/**
 * Validates the payload against the PII denylist.
 * In development builds, throws on the first violation so it surfaces during
 * authoring.  In production, silently removes offending keys.
 * @param payload Raw caller-supplied payload.
 * @returns Sanitised payload safe to forward.
 * @throws {Error} In `import.meta.env.DEV` mode when a forbidden key is found.
 */
function sanitizePayload(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (isForbidden(key, value)) {
      if (isDevMode()) {
        throw new Error(
          `[nblab telemetry] forbidden field "${key}" in event payload`,
        );
      }
      // Production: silently drop the field.
      continue;
    }
    clean[key] = value;
  }
  return clean;
}

/**
 * Records a notebook-lab telemetry event via the shared observability backend.
 *
 * PII rules are enforced before the call reaches the provider adapter:
 * - Dev mode throws on any forbidden field so it surfaces immediately.
 * - Production silently strips forbidden fields.
 *
 * The observability call is wrapped in try/catch so a provider failure can
 * never crash the app or interrupt the learner's session.
 * @param event Event name from {@link NotebookLabEvent}.
 * @param payload Optional structured metadata to attach to the event.
 */
export function trackEvent(
  event: NotebookLabEvent,
  payload?: Record<string, unknown>,
): void {
  const safe = payload !== undefined ? sanitizePayload(payload) : {};
  try {
    metrics.count(event, 1, safe);
  } catch (err) {
    // Telemetry must never interrupt the user experience.
    console.warn('[nblab telemetry] event recording failed:', err);
  }
}
