import type {
  AdaptivePolicy,
  CourseModel,
  CurriculumChange,
  Experience,
  Lesson,
  Unit,
  WidgetDescriptor,
} from '../authoring/model.js';
import type {CurriculumSnapshot} from '../store/SessionStore.js';

export interface PublishedWidget {
  id: string;
  descriptor: WidgetDescriptor;
  source?: string;
  validation: {
    hasHtml: boolean;
    networkPolicy: 'none';
    cspPresent: boolean;
  };
}

export interface ExperienceOfflineReport {
  experienceId: string;
  kind: Experience['kind'];
  deterministic: boolean;
  flags: string[];
}

export interface LessonOfflineReport {
  lessonId: string;
  displayName: string;
  contentPresent: boolean;
  deterministicNextStep: boolean;
  experiences: ExperienceOfflineReport[];
}

export interface LevelbuilderChangeSet {
  generatedAt: string;
  courseIds: string[];
  changes: CurriculumChange[];
  newObjects: {
    units: Unit[];
    lessons: Lesson[];
    experiences: Experience[];
  };
  widgets: PublishedWidget[];
  offline: LessonOfflineReport[];
  adaptivePolicies: {lessonId: string; policy: AdaptivePolicy}[];
}

export interface BuildChangeSetInput {
  snapshot: CurriculumSnapshot;
  changes: CurriculumChange[];
  readWidgetSource: (widgetId: string) => string | undefined;
  generatedAt?: Date;
}

const DRAFT_PREFIX = 'draft:';

/**
 * Projects the session into the artifact a future Rails write adapter would
 * consume: the full change log plus everything a reviewer needs to judge it —
 * which objects are new, what the widgets contain, and whether each lesson
 * still plays with no network and no model.
 */
export function buildChangeSet(
  input: BuildChangeSetInput,
): LevelbuilderChangeSet {
  const {snapshot, changes, readWidgetSource} = input;
  const generatedAt = (input.generatedAt ?? new Date()).toISOString();

  return {
    generatedAt,
    courseIds: touchedCourseIds(snapshot.courses, changes),
    changes,
    newObjects: collectDrafts(snapshot.courses),
    widgets: snapshot.widgets.map(descriptor =>
      publishWidget(descriptor, readWidgetSource(descriptor.id)),
    ),
    offline: eachLesson(snapshot.courses).map(({lesson}) =>
      offlineReport(lesson),
    ),
    adaptivePolicies: eachLesson(snapshot.courses)
      .filter(({lesson}) => lesson.adaptivePolicy)
      .map(({lesson}) => ({
        lessonId: lesson.id,
        policy: lesson.adaptivePolicy as AdaptivePolicy,
      })),
  };
}

function eachLesson(
  courses: CourseModel[],
): {course: CourseModel; unit: Unit; lesson: Lesson}[] {
  return courses.flatMap(course =>
    course.units.flatMap(unit =>
      unit.lessons.map(lesson => ({course, unit, lesson})),
    ),
  );
}

/** Every id owned by a course, so change targets can be traced back to one. */
function courseIdIndex(courses: CourseModel[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const course of courses) {
    index.set(course.id, course.id);
    for (const unit of course.units) {
      index.set(unit.id, course.id);
      for (const lesson of unit.lessons) {
        index.set(lesson.id, course.id);
        for (const experience of lesson.experiences) {
          index.set(experience.id, course.id);
        }
      }
    }
  }
  return index;
}

function changeTargets(change: CurriculumChange): string[] {
  switch (change.op) {
    case 'createCourse':
      return [change.course.id];
    case 'createUnit':
      return [change.courseId, change.unit.id];
    case 'createLesson':
      return [change.unitId, change.lesson.id];
    case 'updateUnit':
      return [change.unitId];
    case 'updateLesson':
      return [change.lessonId];
    case 'insertExperience':
      return [change.lessonId, change.experience.id];
    case 'removeExperience':
      return [change.lessonId, change.experienceId];
    case 'moveExperience':
      return [
        change.lessonId,
        change.experienceId,
        ...(change.toLessonId ? [change.toLessonId] : []),
      ];
    case 'updateContent':
      return [change.experienceId];
    case 'attachExistingLevel':
      return [change.lessonId];
    default:
      return [];
  }
}

function touchedCourseIds(
  courses: CourseModel[],
  changes: CurriculumChange[],
): string[] {
  const index = courseIdIndex(courses);
  const touched = new Set<string>();
  for (const change of changes) {
    for (const target of changeTargets(change)) {
      const courseId = index.get(target);
      if (courseId) {
        touched.add(courseId);
      }
    }
  }
  return [...touched];
}

function collectDrafts(
  courses: CourseModel[],
): LevelbuilderChangeSet['newObjects'] {
  const units: Unit[] = [];
  const lessons: Lesson[] = [];
  const experiences: Experience[] = [];

  for (const course of courses) {
    for (const unit of course.units) {
      if (unit.id.startsWith(DRAFT_PREFIX)) {
        units.push(unit);
      }
      for (const lesson of unit.lessons) {
        if (lesson.id.startsWith(DRAFT_PREFIX)) {
          lessons.push(lesson);
        }
        for (const experience of lesson.experiences) {
          if (experience.id.startsWith(DRAFT_PREFIX)) {
            experiences.push(experience);
          }
        }
      }
    }
  }

  return {units, lessons, experiences};
}

function publishWidget(
  descriptor: WidgetDescriptor,
  source: string | undefined,
): PublishedWidget {
  return {
    id: descriptor.id,
    descriptor,
    ...(source === undefined ? {} : {source}),
    validation: {
      hasHtml: Boolean(source && source.trim().length > 0),
      networkPolicy: 'none',
      cspPresent: Boolean(source?.includes('Content-Security-Policy')),
    },
  };
}

function offlineReport(lesson: Lesson): LessonOfflineReport {
  const hasExperiences = lesson.experiences.length > 0;
  return {
    lessonId: lesson.id,
    displayName: lesson.displayName,
    contentPresent: hasExperiences,
    deterministicNextStep: hasExperiences,
    experiences: lesson.experiences.map(experienceOfflineReport),
  };
}

function experienceOfflineReport(
  experience: Experience,
): ExperienceOfflineReport {
  if (experience.kind !== 'existingLevel') {
    return {
      experienceId: experience.id,
      kind: experience.kind,
      deterministic: true,
      flags: [],
    };
  }

  // Video embeds are the one authored path that still reaches the network.
  const isVideo = experience.data?.type === 'video';
  const unsupported = experience.runtime === 'unsupported';

  return {
    experienceId: experience.id,
    kind: experience.kind,
    deterministic: !unsupported,
    flags: [
      ...(isVideo ? ['external-video'] : []),
      ...(unsupported
        ? [`unsupported-level-type:${experience.levelType}`]
        : []),
    ],
  };
}
