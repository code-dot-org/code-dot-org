import type {CourseModel, CurriculumChange} from '@code-dot-org/authoring';

/** Every id currently in the live tree, mapped to its course — including a
 * widget experience's own widgetId, since createWidget/updateWidgetMetadata
 * never carry a lesson/course id directly. Most changes target an imported
 * (levelbuilder) lesson/course, which was seeded straight into the snapshot
 * and never went through a createCourse/createUnit/createLesson change, so
 * this tree walk — not the log — is the only way to resolve those. */
function seedFromTree(courses: CourseModel[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const course of courses) {
    index.set(course.id, course.id);
    for (const unit of course.units) {
      index.set(unit.id, course.id);
      for (const lesson of unit.lessons) {
        index.set(lesson.id, course.id);
        for (const experience of lesson.experiences) {
          index.set(experience.id, course.id);
          if (experience.kind === 'widget') {
            index.set(experience.widgetId, course.id);
          }
        }
      }
    }
  }
  return index;
}

/**
 * Maps every id a change has ever targeted to the course it belongs to.
 * Seeded from the live tree (covers every currently-present id, imported or
 * session-created alike), then layered with a replay of the log to fill in
 * ids the tree can no longer see — an id a create* op minted that was since
 * removed (a removeCourse/removeExperience change still resolves to the
 * course it happened in) — and to let a later change chain off an id an
 * earlier change in the same session introduced.
 */
function buildCourseIdIndex(
  changes: CurriculumChange[],
  courses: CourseModel[],
): Map<string, string> {
  const index = seedFromTree(courses);
  const courseOf = (id: string): string | undefined => index.get(id);

  for (const change of changes) {
    switch (change.op) {
      case 'createCourse':
        index.set(change.course.id, change.course.id);
        break;
      case 'createUnit':
        index.set(change.unit.id, change.courseId);
        break;
      case 'createLesson': {
        const courseId = courseOf(change.unitId);
        if (courseId) {
          index.set(change.lesson.id, courseId);
        }
        break;
      }
      case 'insertExperience': {
        const courseId = courseOf(change.lessonId);
        if (courseId) {
          index.set(change.experience.id, courseId);
          if (change.experience.kind === 'widget') {
            index.set(change.experience.widgetId, courseId);
          }
        }
        break;
      }
      case 'createLevel': {
        const courseId = courseOf(change.lessonId);
        if (courseId) {
          index.set(change.level.id, courseId);
        }
        break;
      }
      case 'attachExistingLevel': {
        const courseId = courseOf(change.lessonId);
        if (courseId) {
          // Deterministic id apply.ts's resolveLevel/unresolvedExistingLevel
          // both mint for an attached level — see revert.ts.
          index.set(`lb:${change.levelKey}`, courseId);
        }
        break;
      }
      case 'moveExperience': {
        const courseId = courseOf(change.toLessonId ?? change.lessonId);
        if (courseId) {
          index.set(change.experienceId, courseId);
        }
        break;
      }
      default:
        break;
    }
  }
  return index;
}

/** The one id a change is "about", before resolving it to a course. */
function targetId(change: CurriculumChange): string | undefined {
  switch (change.op) {
    case 'createCourse':
      return change.course.id;
    case 'removeCourse':
      return change.courseId;
    case 'createUnit':
      return change.courseId;
    case 'createLesson':
      return change.unitId;
    case 'updateUnit':
      return change.unitId;
    case 'updateLesson':
      return change.lessonId;
    case 'insertExperience':
      return change.lessonId;
    case 'removeExperience':
      return change.lessonId;
    case 'moveExperience':
      return change.toLessonId ?? change.lessonId;
    case 'updateContent':
      return change.experienceId;
    case 'attachExistingLevel':
      return change.lessonId;
    case 'createWidget':
      return change.descriptor.id;
    case 'updateWidgetMetadata':
      return change.widgetId;
    case 'adoptCatalogWidget':
      return change.experienceId;
    case 'createLevel':
      return change.lessonId;
    case 'updateLevel':
      return change.experienceId;
    case 'overrideLevelInstructions':
      return change.experienceId;
    case 'overrideLevelDefinition':
      return change.experienceId;
    case 'updateGenericLevelData':
      return change.experienceId;
    default:
      return undefined;
  }
}

// createCourse/removeCourse/createUnit carry a courseId (or the course's own
// id) directly — no index lookup needed, and none possible for createCourse
// on its own first change (nothing indexed it yet).
const DIRECT_COURSE_ID_OPS = new Set([
  'createCourse',
  'removeCourse',
  'createUnit',
]);

function courseIdForChange(
  change: CurriculumChange,
  index: Map<string, string>,
): string | undefined {
  const id = targetId(change);
  if (id === undefined) {
    return undefined;
  }
  return DIRECT_COURSE_ID_OPS.has(change.op) ? id : index.get(id);
}

/** This course's changes, most recent first. `courses` is the live tree —
 * needed to resolve a change against an imported lesson/unit/course, which
 * was seeded into the snapshot rather than created by a change. */
export function changesForCourse(
  changes: CurriculumChange[],
  courses: CourseModel[],
  courseId: string,
): CurriculumChange[] {
  const index = buildCourseIdIndex(changes, courses);
  return changes
    .filter(change => courseIdForChange(change, index) === courseId)
    .sort((a, b) => b.seq - a.seq);
}

function findLessonName(courses: CourseModel[], lessonId: string): string {
  for (const course of courses) {
    for (const unit of course.units) {
      const lesson = unit.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return lesson.displayName;
      }
    }
  }
  return lessonId;
}

function findExperienceName(
  courses: CourseModel[],
  experienceId: string,
): string {
  for (const course of courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        const experience = lesson.experiences.find(e => e.id === experienceId);
        if (experience) {
          return experience.title ?? experienceId;
        }
      }
    }
  }
  return experienceId;
}

function findWidgetName(courses: CourseModel[], widgetId: string): string {
  for (const course of courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        const experience = lesson.experiences.find(
          e => e.kind === 'widget' && e.widgetId === widgetId,
        );
        if (experience) {
          return experience.title ?? widgetId;
        }
      }
    }
  }
  return widgetId;
}

const EXPERIENCE_KIND_LABEL: Record<string, string> = {
  content: 'content',
  existingLevel: 'a level',
  widget: 'a widget',
};

/** One human-readable line per change, resolved against the live course tree
 * so a renamed lesson/experience reads by its current name, not a stale one. */
export function summarizeChange(
  change: CurriculumChange,
  courses: CourseModel[],
): string {
  switch (change.op) {
    case 'createCourse':
      return `Created course “${change.course.displayName}”`;
    case 'removeCourse':
      return `Removed course ${change.courseId}`;
    case 'createUnit':
      return `Created unit “${change.unit.displayName}”`;
    case 'createLesson':
      return `Created lesson “${change.lesson.displayName}”`;
    case 'updateUnit':
      return `Updated unit ${findLessonName(courses, change.unitId)} (${Object.keys(change.patch).join(', ')})`;
    case 'updateLesson':
      return `Updated lesson “${findLessonName(courses, change.lessonId)}” (${Object.keys(change.patch).join(', ')})`;
    case 'insertExperience':
      return `Added ${EXPERIENCE_KIND_LABEL[change.experience.kind] ?? 'an activity'} “${change.experience.title ?? change.experience.id}” to lesson “${findLessonName(courses, change.lessonId)}”`;
    case 'removeExperience':
      return `Removed an activity from lesson “${findLessonName(courses, change.lessonId)}”`;
    case 'moveExperience':
      return change.toLessonId && change.toLessonId !== change.lessonId
        ? `Moved an activity to lesson “${findLessonName(courses, change.toLessonId)}”`
        : `Reordered an activity within lesson “${findLessonName(courses, change.lessonId)}”`;
    case 'updateContent':
      return `Edited content of “${findExperienceName(courses, change.experienceId)}”`;
    case 'attachExistingLevel':
      return `Attached level ${change.levelKey} to lesson “${findLessonName(courses, change.lessonId)}”`;
    case 'createWidget':
      return `Created widget “${change.descriptor.title}”`;
    case 'updateWidgetMetadata':
      return `Updated widget “${findWidgetName(courses, change.widgetId)}”`;
    case 'adoptCatalogWidget':
      return change.catalogRef
        ? `Adopted catalog widget ${change.catalogRef.slug} v${change.catalogRef.version} for “${findExperienceName(courses, change.experienceId)}”`
        : `Reverted “${findExperienceName(courses, change.experienceId)}” to its session draft`;
    case 'createLevel':
      return `Created level “${change.level.title ?? change.level.id}” in lesson “${findLessonName(courses, change.lessonId)}”`;
    case 'updateLevel':
      return `Updated level “${findExperienceName(courses, change.experienceId)}”`;
    case 'overrideLevelInstructions':
      return `Edited instructions for “${findExperienceName(courses, change.experienceId)}”`;
    case 'overrideLevelDefinition':
      return `Edited level “${findExperienceName(courses, change.experienceId)}”`;
    case 'updateGenericLevelData':
      return `Updated ${change.data.type} content of “${findExperienceName(courses, change.experienceId)}”`;
  }
}
