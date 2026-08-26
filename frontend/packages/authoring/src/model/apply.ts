import type {CurriculumChange} from './changes';
import type {
  CourseModel,
  Experience,
  ExistingLevelExperience,
  Lesson,
  Unit,
} from './types';
import type {WidgetDescriptor} from './widget';

export interface AuthoringState {
  courses: CourseModel[];
  widgets: WidgetDescriptor[];
}

type ResolveLevel = (levelKey: string) => ExistingLevelExperience | undefined;

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function insertAt<T>(items: readonly T[], index: number, item: T): T[] {
  const position = clamp(index, 0, items.length);
  return [...items.slice(0, position), item, ...items.slice(position)];
}

// Rebuilds only the path from the root to the matched node — sibling
// courses/units/lessons keep their existing object identity.

function replaceCourse(
  state: AuthoringState,
  courseId: string,
  updater: (course: CourseModel) => CourseModel,
): AuthoringState {
  const index = state.courses.findIndex(c => c.id === courseId);
  if (index === -1) throw new Error(`Course not found: ${courseId}`);
  const courses = state.courses.slice();
  courses[index] = updater(courses[index]);
  return {...state, courses};
}

function replaceUnit(
  state: AuthoringState,
  unitId: string,
  updater: (unit: Unit) => Unit,
): AuthoringState {
  for (const course of state.courses) {
    const index = course.units.findIndex(u => u.id === unitId);
    if (index === -1) continue;
    const units = course.units.slice();
    units[index] = updater(units[index]);
    return replaceCourse(state, course.id, () => ({...course, units}));
  }
  throw new Error(`Unit not found: ${unitId}`);
}

function replaceLesson(
  state: AuthoringState,
  lessonId: string,
  updater: (lesson: Lesson) => Lesson,
): AuthoringState {
  for (const course of state.courses) {
    for (const unit of course.units) {
      const index = unit.lessons.findIndex(l => l.id === lessonId);
      if (index === -1) continue;
      const lessons = unit.lessons.slice();
      lessons[index] = updater(lessons[index]);
      return replaceUnit(state, unit.id, () => ({...unit, lessons}));
    }
  }
  throw new Error(`Lesson not found: ${lessonId}`);
}

function findLesson(state: AuthoringState, lessonId: string): Lesson {
  for (const course of state.courses) {
    for (const unit of course.units) {
      const lesson = unit.lessons.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  throw new Error(`Lesson not found: ${lessonId}`);
}

function findLessonIdForExperience(
  state: AuthoringState,
  experienceId: string,
): string {
  for (const course of state.courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        if (lesson.experiences.some(e => e.id === experienceId)) {
          return lesson.id;
        }
      }
    }
  }
  throw new Error(`Experience not found: ${experienceId}`);
}

function applyContentPatch(
  experience: Experience,
  patch: {title?: string; markdown?: string},
): Experience {
  const withTitle =
    patch.title !== undefined
      ? {...experience, title: patch.title}
      : experience;
  if (patch.markdown === undefined) return withTitle;

  if (withTitle.kind === 'content') {
    return {...withTitle, markdown: patch.markdown};
  }
  if (
    withTitle.kind === 'existingLevel' &&
    withTitle.data &&
    'markdown' in withTitle.data
  ) {
    return {...withTitle, data: {...withTitle.data, markdown: patch.markdown}};
  }
  // markdown doesn't apply to this experience's kind/data — no-op, not an error.
  return withTitle;
}

function unresolvedExistingLevel(levelKey: string): ExistingLevelExperience {
  return {
    id: `lb:${levelKey}`,
    origin: 'levelbuilder',
    kind: 'existingLevel',
    levelKey,
    levelType: 'unknown',
    runtime: 'unsupported',
    data: {type: 'opaque', levelType: 'unknown', properties: {}},
  };
}

/**
 * Pure, immutable state transition: given a state tree and one change,
 * returns a new tree. Never mutates `state`. Throws on a change that
 * references an id not present in `state`.
 *
 * `resolveLevel` backs `attachExistingLevel`, whose change entry carries
 * only a `levelKey` (the log is serializable JSON, not a resolver). When
 * omitted or unable to resolve the key, the level attaches as an opaque,
 * unsupported experience that still preserves the key.
 */
export function applyChange(
  state: AuthoringState,
  change: CurriculumChange,
  resolveLevel?: ResolveLevel,
): AuthoringState {
  switch (change.op) {
    case 'createCourse': {
      const course: CourseModel = {...change.course, units: []};
      return {...state, courses: [...state.courses, course]};
    }

    case 'createUnit': {
      const unit: Unit = {...change.unit, lessons: []};
      return replaceCourse(state, change.courseId, course => ({
        ...course,
        units: insertAt(
          course.units,
          change.position ?? course.units.length,
          unit,
        ),
      }));
    }

    case 'createLesson': {
      const lesson: Lesson = {...change.lesson, experiences: []};
      return replaceUnit(state, change.unitId, unit => ({
        ...unit,
        lessons: insertAt(
          unit.lessons,
          change.position ?? unit.lessons.length,
          lesson,
        ),
      }));
    }

    case 'updateUnit':
      return replaceUnit(state, change.unitId, unit => ({
        ...unit,
        ...change.patch,
      }));

    case 'updateLesson':
      return replaceLesson(state, change.lessonId, lesson => ({
        ...lesson,
        ...change.patch,
      }));

    case 'insertExperience':
      return replaceLesson(state, change.lessonId, lesson => ({
        ...lesson,
        experiences: insertAt(
          lesson.experiences,
          change.position,
          change.experience,
        ),
      }));

    case 'removeExperience':
      return replaceLesson(state, change.lessonId, lesson => {
        if (!lesson.experiences.some(e => e.id === change.experienceId)) {
          throw new Error(`Experience not found: ${change.experienceId}`);
        }
        return {
          ...lesson,
          experiences: lesson.experiences.filter(
            e => e.id !== change.experienceId,
          ),
        };
      });

    case 'moveExperience': {
      const sourceLesson = findLesson(state, change.lessonId);
      const experience = sourceLesson.experiences.find(
        e => e.id === change.experienceId,
      );
      if (!experience) {
        throw new Error(`Experience not found: ${change.experienceId}`);
      }
      const targetLessonId = change.toLessonId ?? change.lessonId;

      if (targetLessonId === change.lessonId) {
        return replaceLesson(state, change.lessonId, lesson => {
          const without = lesson.experiences.filter(
            e => e.id !== change.experienceId,
          );
          return {
            ...lesson,
            experiences: insertAt(without, change.toPosition, experience),
          };
        });
      }

      const withoutSource = replaceLesson(state, change.lessonId, lesson => ({
        ...lesson,
        experiences: lesson.experiences.filter(
          e => e.id !== change.experienceId,
        ),
      }));
      return replaceLesson(withoutSource, targetLessonId, lesson => ({
        ...lesson,
        experiences: insertAt(
          lesson.experiences,
          change.toPosition,
          experience,
        ),
      }));
    }

    case 'updateContent': {
      const lessonId = findLessonIdForExperience(state, change.experienceId);
      return replaceLesson(state, lessonId, lesson => ({
        ...lesson,
        experiences: lesson.experiences.map(e =>
          e.id === change.experienceId ? applyContentPatch(e, change.patch) : e,
        ),
      }));
    }

    case 'attachExistingLevel': {
      const experience =
        resolveLevel?.(change.levelKey) ??
        unresolvedExistingLevel(change.levelKey);
      return replaceLesson(state, change.lessonId, lesson => ({
        ...lesson,
        experiences: insertAt(lesson.experiences, change.position, experience),
      }));
    }

    case 'createWidget':
      return {...state, widgets: [...state.widgets, change.descriptor]};

    case 'updateWidgetMetadata': {
      const index = state.widgets.findIndex(w => w.id === change.widgetId);
      if (index === -1) {
        throw new Error(`Widget not found: ${change.widgetId}`);
      }
      const widgets = state.widgets.slice();
      widgets[index] = {...widgets[index], ...change.patch};
      return {...state, widgets};
    }
  }
}
