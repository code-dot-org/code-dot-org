export interface LabLevelUrlParams {
  course?: string;
  unit?: number;
  lesson: number;
  level: number;
  /** Suppress level video autoplay. On by default — nearly every scenario wants it. */
  noautoplay?: boolean;
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
}: LabLevelUrlParams): string {
  const query = new URLSearchParams();
  if (noautoplay) {
    query.set('noautoplay', 'true');
  }
  const queryString = query.toString();
  const path = `/courses/${course}/units/${unit}/lessons/${lesson}/levels/${level}`;
  return queryString ? `${path}?${queryString}` : path;
}
