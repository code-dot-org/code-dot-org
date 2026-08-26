import type {AuthoringBridge} from '../authoring/bridge.js';
import type {AuthoringState} from '../state/AuthoringState.js';

export const IMPORTED_COURSE_NAME = 'k5-ai-data-2024';

/**
 * Seed the session from the on-disk Levelbuilder serialization the first time
 * it boots. The import is a read-only projection; later edits accumulate in the
 * change log, so re-importing over an existing course would discard them.
 */
export async function importCourseIfMissing(
  state: AuthoringState,
  bridge: AuthoringBridge,
  repoRoot: string,
  courseName: string = IMPORTED_COURSE_NAME,
): Promise<void> {
  const present = state
    .getSnapshot()
    .courses.some(course => course.id === courseName);
  if (present) {
    return;
  }

  if (!bridge.loadCourse) {
    console.error(
      `[authoring-service] cannot import ${courseName}: ` +
        '@code-dot-org/authoring/node did not provide loadCourse',
    );
    return;
  }

  const {course, levelProperties, warnings} = await bridge.loadCourse(
    repoRoot,
    courseName,
  );
  for (const warning of warnings) {
    console.warn(`[authoring-service] import ${courseName}: ${warning}`);
  }

  state.seedCourse(course, levelProperties);
  console.log(
    `[authoring-service] imported ${courseName}: ` +
      `${course.units.length} unit(s), ` +
      `${course.units.reduce((n, unit) => n + unit.lessons.length, 0)} lesson(s), ` +
      `${Object.keys(levelProperties).length} level properties`,
  );
}
