export interface LabLevelUrlParams {
  course?: string;
  unit?: number;
  lesson: number;
  level: number;
  /** Suppress level video autoplay. On by default — nearly every scenario wants it. */
  noautoplay?: boolean;
  /** Show level callouts (qTip tooltips). Emitted as ?show_callouts=1. */
  showCallouts?: boolean;
  /** Suppress first-run product-tour overlays. Emitted as ?hideProductTours=true. */
  hideProductTours?: boolean;
  /** Force the HTML5 fallback video player. Emitted as ?force_youtube_fallback=1. */
  forceYoutubeFallback?: boolean;
  /** Force a UI locale. Emitted as a /lang/<code> path segment, which Rails rewrites to ?lang=<code>. */
  lang?: string;
}

/**
 * Build a relative URL for a lab level. Most ported scenarios target
 * allthethingscourse unit 1 and vary only lesson/level.
 *
 * Usage: labLevelUrl({lesson: 6, level: 2})
 */
export function labLevelUrl({
  course = 'allthethingscourse',
  unit = 1,
  lesson,
  level,
  noautoplay = true,
  showCallouts = false,
  hideProductTours = false,
  forceYoutubeFallback = false,
  lang,
}: LabLevelUrlParams): string {
  const query = new URLSearchParams();
  if (noautoplay) {
    query.set('noautoplay', 'true');
  }
  if (showCallouts) {
    query.set('show_callouts', '1');
  }
  if (hideProductTours) {
    query.set('hideProductTours', 'true');
  }
  if (forceYoutubeFallback) {
    query.set('force_youtube_fallback', '1');
  }
  const queryString = query.toString();
  const langSegment = lang ? `/lang/${lang}` : '';
  const path = `/courses/${course}/units/${unit}/lessons/${lesson}/levels/${level}${langSegment}`;
  return queryString ? `${path}?${queryString}` : path;
}

export interface UnitOverviewUrlParams {
  course?: string;
  unit?: number;
}

/** Build a relative URL for a unit overview page. */
export function unitOverviewUrl({
  course = 'allthethingscourse',
  unit = 1,
}: UnitOverviewUrlParams = {}): string {
  return `/courses/${course}/units/${unit}`;
}

export interface LessonOverviewUrlParams {
  course?: string;
  unit?: number;
  lesson: number;
}

/** Build a relative URL for a lesson overview (lesson plan) page. */
export function lessonOverviewUrl({
  course = 'allthethingscourse',
  unit = 1,
  lesson,
}: LessonOverviewUrlParams): string {
  return `/courses/${course}/units/${unit}/lessons/${lesson}`;
}
