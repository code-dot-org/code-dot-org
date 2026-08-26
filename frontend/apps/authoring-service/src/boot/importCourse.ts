import type {AuthoringBridge} from '../authoring/bridge.js';
import type {CourseModel} from '../authoring/model.js';
import type {AuthoringState} from '../state/AuthoringState.js';

export const IMPORTED_COURSE_NAME = 'k5-ai-data-2024';

/**
 * `buildCourse` numbers each course's synthetic (Fish/Music) level ids from
 * the same base (`FIRST_SYNTHETIC_LEVEL_ID`, see
 * `@code-dot-org/authoring/src/importer/buildCourse.ts`) because it runs as a
 * pure, single-course function with no notion of a wider session. Importing
 * more than one course into the same session — `AUTHORING_IMPORT_COURSES` —
 * then collides: course B's id 9000001 overwrites course A's id 9000001 in
 * the shared `levelProperties` map (`AuthoringState.seedCourse`'s plain
 * object spread), silently swapping one course's labhost level for another's.
 * Remap each course's ids to a fresh range, starting above whatever the
 * session already holds, before merging it in.
 */
function remapNumericIds(
  course: CourseModel,
  levelProperties: Record<string, Record<string, unknown>>,
  startId: number,
): Record<string, Record<string, unknown>> {
  const idMap = new Map<string, number>();
  let nextId = startId;
  const remapped: Record<string, Record<string, unknown>> = {};
  for (const [oldId, properties] of Object.entries(levelProperties)) {
    const newId = nextId++;
    idMap.set(oldId, newId);
    remapped[String(newId)] = {...properties, id: newId};
  }
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      for (const experience of lesson.experiences) {
        if (
          experience.kind === 'existingLevel' &&
          experience.levelNumericId != null
        ) {
          const mapped = idMap.get(String(experience.levelNumericId));
          if (mapped != null) {
            experience.levelNumericId = mapped;
          }
        }
      }
    }
  }
  return remapped;
}

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

  const remappedProperties = remapNumericIds(
    course,
    levelProperties,
    state.nextLevelNumericId(),
  );
  state.seedCourse(course, remappedProperties);
  console.log(
    `[authoring-service] imported ${courseName}: ` +
      `${course.units.length} unit(s), ` +
      `${course.units.reduce((n, unit) => n + unit.lessons.length, 0)} lesson(s), ` +
      `${Object.keys(levelProperties).length} level properties`,
  );
}
