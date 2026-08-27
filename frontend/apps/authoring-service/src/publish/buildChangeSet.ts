import {injectWidgetChrome} from '@code-dot-org/widget-runtime/chrome';

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
    networkPolicy: 'none' | 'unknown';
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
    courses: CourseModel[];
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
    newObjects: collectNewObjects(snapshot.courses, changes),
    widgets: snapshot.widgets.map(descriptor =>
      // One widget whose source can't be read must not fail the whole
      // publish; treat it as source-absent and let its validation flags say so.
      publishWidget(
        descriptor,
        safeReadWidgetSource(readWidgetSource, descriptor.id),
      ),
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
    case 'overrideLevelInstructions':
      return [change.experienceId];
    case 'overrideLevelDefinition':
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

/** Every id a create* change minted this session, by category — regardless
 * of what prefix (if any) the id happens to carry. */
function newIds(changes: CurriculumChange[]): {
  courses: Set<string>;
  units: Set<string>;
  lessons: Set<string>;
  experiences: Set<string>;
} {
  const courses = new Set<string>();
  const units = new Set<string>();
  const lessons = new Set<string>();
  const experiences = new Set<string>();
  for (const change of changes) {
    switch (change.op) {
      case 'createCourse':
        courses.add(change.course.id);
        break;
      case 'createUnit':
        units.add(change.unit.id);
        break;
      case 'createLesson':
        lessons.add(change.lesson.id);
        break;
      case 'insertExperience':
        experiences.add(change.experience.id);
        break;
      case 'createLevel':
        experiences.add(change.level.id);
        break;
      default:
        break;
    }
  }
  return {courses, units, lessons, experiences};
}

/**
 * Walks the current tree (so a lesson created this session but since
 * retitled still comes back with its latest displayName) and keeps only the
 * ids the change log says this session actually minted — an id-prefix
 * convention (`draft-`) is just one possible minting scheme among several
 * (see ClaudeAgentRunner's create_level, which mints the level's own id
 * with a `draft-` prefix but not every object a future write adapter might
 * introduce is guaranteed to), so newness is derived from the log itself.
 */
function collectNewObjects(
  courses: CourseModel[],
  changes: CurriculumChange[],
): LevelbuilderChangeSet['newObjects'] {
  const ids = newIds(changes);
  const newCourses: CourseModel[] = [];
  const units: Unit[] = [];
  const lessons: Lesson[] = [];
  const experiences: Experience[] = [];

  for (const course of courses) {
    if (ids.courses.has(course.id)) {
      newCourses.push(course);
    }
    for (const unit of course.units) {
      if (ids.units.has(unit.id)) {
        units.push(unit);
      }
      for (const lesson of unit.lessons) {
        if (ids.lessons.has(lesson.id)) {
          lessons.push(lesson);
        }
        for (const experience of lesson.experiences) {
          if (ids.experiences.has(experience.id)) {
            experiences.push(experience);
          }
        }
      }
    }
  }

  return {courses: newCourses, units, lessons, experiences};
}

// injectWidgetChrome always strips any widget-supplied CSP and applies this
// exact policy (see widgetChrome.ts); checking for it specifically — rather
// than any mention of "Content-Security-Policy" — can't be fooled by a
// widget that puts the phrase in a comment without a real policy applying.
const OUR_DEFAULT_SRC_NONE = "default-src 'none'";

// A read that throws (a bad id that slipped into state, a permissions error)
// degrades to source-absent rather than failing the whole publish.
function safeReadWidgetSource(
  readWidgetSource: (id: string) => string | undefined,
  id: string,
): string | undefined {
  try {
    return readWidgetSource(id);
  } catch {
    return undefined;
  }
}

function publishWidget(
  descriptor: WidgetDescriptor,
  rawSource: string | undefined,
): PublishedWidget {
  // The stored source is raw agent output; the CSP and McpApp shim are only
  // injected at serve time (see GET /api/widgets/:id). Validate — and publish
  // — what a learner's iframe actually receives, not what the agent wrote.
  const source =
    rawSource === undefined ? undefined : injectWidgetChrome(rawSource);
  const cspPresent = Boolean(source?.includes(OUR_DEFAULT_SRC_NONE));
  return {
    id: descriptor.id,
    descriptor,
    ...(source === undefined ? {} : {source}),
    validation: {
      hasHtml: Boolean(source && source.trim().length > 0),
      networkPolicy: cspPresent ? 'none' : 'unknown',
      cspPresent,
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
