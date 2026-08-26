/**
 * Mirror of the `@code-dot-org/authoring` domain model, kept identical to that
 * package's `src/model/*`.
 *
 * The package is authored in parallel with this service and publishes from
 * `dist/`, which does not exist until it builds. Local copies keep the service
 * type-checkable meanwhile; once the package builds, replace every declaration
 * below with a re-export.
 *
 * `CurriculumChangeBody`, `CURRICULUM_CHANGE_OPS` and `ApplyChange` are this
 * service's own: the package's `CurriculumChange` is already stamped, and the
 * service needs the unstamped payload and the op list to validate a request.
 */

export type Origin = 'levelbuilder' | 'draft';

export interface CourseModel {
  id: string;
  offeringKey?: string;
  displayName: string;
  gradeLevels?: string;
  origin: Origin;
  units: Unit[];
}

export interface Unit {
  id: string;
  displayName: string;
  origin: Origin;
  overview?: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  lessonKey?: string;
  displayName: string;
  origin: Origin;
  goal?: string;
  durationMinutes?: number;
  overview?: string;
  outline?: string[];
  expectedOutcome?: string;
  experiences: Experience[];
  adaptivePolicy?: AdaptivePolicy;
}

interface ExperienceBase {
  id: string;
  origin: Origin;
  title?: string;
}

export interface ContentExperience extends ExperienceBase {
  kind: 'content';
  markdown: string;
}

export interface ExistingLevelExperience extends ExperienceBase {
  kind: 'existingLevel';
  levelKey: string;
  levelType: string;
  runtime: 'labhost' | 'generic' | 'unsupported';
  labKey?: 'oceans' | 'music';
  levelNumericId?: number;
  data?: GenericLevelData;
}

export interface WidgetExperience extends ExperienceBase {
  kind: 'widget';
  widgetId: string;
  toolName: string;
  description?: string;
  defaultInput?: Record<string, unknown>;
}

export type Experience =
  | ContentExperience
  | ExistingLevelExperience
  | WidgetExperience;

/** Structured payload for the renderers that stand in for Rails level views. */
export type GenericLevelData =
  | {
      type: 'multi';
      question: string;
      answers: {text: string; correct: boolean}[];
      allowMultipleAttempts?: boolean;
      markdown?: string;
    }
  | {
      type: 'match';
      pairs: {question: string; answer: string}[];
      markdown?: string;
    }
  | {type: 'markdown'; markdown: string}
  | {
      type: 'video';
      videoKey: string;
      youtubeCode?: string;
      displayName?: string;
    }
  | {
      type: 'levelGroup';
      title?: string;
      pages: {levels: {levelKey: string; data: GenericLevelData}[]}[];
    }
  | {
      type: 'bubbleChoice';
      displayName?: string;
      choices: {levelKey: string; displayName?: string}[];
    }
  | {type: 'opaque'; levelType: string; properties?: Record<string, unknown>};

export interface AdaptivePolicy {
  tutorGuidance?: string;
  alternatives?: Record<string, string[]>;
  allowRepeat?: boolean;
}

// widgetId addresses a directory under the session's widgets/ store
// (SessionStore.widgetDir); anything outside this shape risks path
// traversal (`../../etc/passwd`) once joined onto a filesystem path. The
// length bound keeps an over-long id from passing validation only to blow up
// as ENAMETOOLONG at mkdir time — after the change was already committed to
// state, which left the store publishing-broken for the session.
export const WIDGET_ID_MAX_LENGTH = 64;
export const WIDGET_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

export interface WidgetDescriptor {
  id: string;
  toolName: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  resourceUri: string;
  visibility: ('model' | 'app')[];
  network: 'none';
  eventTypes?: string[];
}

export type CourseStub = Omit<CourseModel, 'units'>;
export type UnitStub = Omit<Unit, 'lessons'>;
export type LessonStub = Omit<Lesson, 'experiences'>;
export type LessonPatch = Partial<
  Omit<Lesson, 'id' | 'origin' | 'lessonKey' | 'experiences'>
>;

export interface ContentPatch {
  title?: string;
  markdown?: string;
}

/** The mutation payload before the store stamps `seq`/`at`/`actor`. */
export type CurriculumChangeBody =
  | {op: 'createCourse'; course: CourseStub}
  | {op: 'removeCourse'; courseId: string}
  | {op: 'createUnit'; courseId: string; unit: UnitStub; position?: number}
  | {op: 'createLesson'; unitId: string; lesson: LessonStub; position?: number}
  | {op: 'updateUnit'; unitId: string; patch: Partial<UnitStub>}
  | {op: 'updateLesson'; lessonId: string; patch: LessonPatch}
  | {
      op: 'insertExperience';
      lessonId: string;
      experience: Experience;
      position: number;
    }
  | {op: 'removeExperience'; lessonId: string; experienceId: string}
  | {
      op: 'moveExperience';
      lessonId: string;
      experienceId: string;
      toPosition: number;
      toLessonId?: string;
    }
  | {op: 'updateContent'; experienceId: string; patch: ContentPatch}
  | {
      op: 'attachExistingLevel';
      lessonId: string;
      levelKey: string;
      position: number;
    }
  | {op: 'createWidget'; descriptor: WidgetDescriptor}
  | {
      op: 'updateWidgetMetadata';
      widgetId: string;
      patch: Partial<WidgetDescriptor>;
    };

export type CurriculumChangeOp = CurriculumChangeBody['op'];

export const CURRICULUM_CHANGE_OPS: readonly CurriculumChangeOp[] = [
  'createCourse',
  'removeCourse',
  'createUnit',
  'createLesson',
  'updateUnit',
  'updateLesson',
  'insertExperience',
  'removeExperience',
  'moveExperience',
  'updateContent',
  'attachExistingLevel',
  'createWidget',
  'updateWidgetMetadata',
];

export type CurriculumChange = {
  seq: number;
  at: string;
  actor: 'agent' | 'author';
} & CurriculumChangeBody;

/** The slice of state `applyChange` reduces over. */
export interface CurriculumState {
  courses: CourseModel[];
  widgets: WidgetDescriptor[];
}

export type ResolveLevel = (
  levelKey: string,
) => ExistingLevelExperience | undefined;

export type ApplyChange = (
  state: CurriculumState,
  change: CurriculumChange,
  resolveLevel?: ResolveLevel,
) => CurriculumState;

/** The `.level` XML projection `@code-dot-org/authoring` exposes. */
export interface ParsedLevel {
  levelType: string;
  properties: Record<string, unknown>;
  [key: string]: unknown;
}

export type ParseLevelXml = (xml: string) => ParsedLevel;

export interface LoadedCourse {
  course: CourseModel;
  levelProperties: Record<string, Record<string, unknown>>;
  warnings: string[];
}
