/**
 * Event reporting for the AI Teaching Assistant drawer.
 *
 * TA events follow Statsig's naming guide rather than the Title Case used by
 * the older events in AnalyticsConstants: snake_case names, variable detail
 * confined to metadata so names stay low-cardinality, and the single most
 * useful breakdown carried in Statsig's own value field.
 */
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

type TaEventName = (typeof EVENTS)[keyof typeof EVENTS];
type TaEventMetadata = Record<string, string | number | boolean | undefined>;

// Statsig silently drops the tail of a longer string field.
const STATSIG_STRING_LIMIT = 64;

export function truncateForStatsig(text: string): string {
  return text.length <= STATSIG_STRING_LIMIT
    ? text
    : `${text.slice(0, STATSIG_STRING_LIMIT - 1)}…`;
}

// Preset chips have no id of their own, so derive one from the label. It is
// stable as long as the wording is, which is what distinguishes it from
// sending the label itself as the breakdown key.
export function presetIdFromLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, STATSIG_STRING_LIMIT);
}

export function sendTaEvent(
  eventName: TaEventName,
  metadata: TaEventMetadata = {},
  value?: string
) {
  analyticsReporter.sendEvent(
    eventName,
    {...metadata, url: window.location.href},
    false,
    value
  );
}

let pendingEntryPoint: string | null = null;

/**
 * The drawer opens from several places, none of which are the code that
 * notices it opened. Whoever triggers an open leaves the entry point here for
 * that observer to collect; an open nobody claimed happened on its own.
 */
export function noteTaPanelEntryPoint(entryPoint: string) {
  pendingEntryPoint = entryPoint;
}

export function takeTaPanelEntryPoint(): string {
  const entryPoint = pendingEntryPoint ?? 'auto_open';
  pendingEntryPoint = null;
  return entryPoint;
}
