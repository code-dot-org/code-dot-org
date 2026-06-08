/**
 * Build a relative level URL for a studio.code.org lab level.
 *
 * Used by both legacy CSF Blockly labs and lab2-architecture labs that live
 * in allthethingscourse (or another named course).
 *
 * @param lesson - lesson number within the course unit
 * @param level - level number within that lesson
 * @param course - course slug; defaults to allthethingscourse
 */
export function labLevelUrl(
  lesson: number,
  level: number,
  course = 'allthethingscourse',
): string {
  return `/courses/${course}/units/1/lessons/${lesson}/levels/${level}?noautoplay=true`;
}

/**
 * Build a relative level URL for the Flappy lab.
 * Flappy uses a standalone route, not the allthethingscourse unit path.
 *
 * @param level - Flappy level number
 */
export function flappyLevelUrl(level: number): string {
  return `/flappy/${level}?noautoplay=true`;
}
