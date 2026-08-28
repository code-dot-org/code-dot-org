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
  labKey?: 'oceans' | 'music' | 'maze';
  levelNumericId?: number;
  data?: GenericLevelData;
  instructionsOverride?: InstructionsPatch;
  definitionOverride?: LevelDefinitionPatch;
}

export interface InstructionsPatch {
  shortInstructions?: string;
  longInstructions?: string;
}

export interface LevelDefinitionPatch {
  serialized_maze?: string | null;
  maze?: string | null;
  initial_dirt?: string | null;
  startBlocksXml?: string | null;
  toolboxBlocksXml?: string | null;
  solutionBlocksXml?: string | null;
  startDirection?: string | null;
  ideal?: string | null;
  solutionVerified?: string | null;
  nectar_goal?: string | null;
  honey_goal?: string | null;
  min_collected?: string | null;
  flower_type?: string | null;
}

export interface WidgetExperience extends ExperienceBase {
  kind: 'widget';
  widgetId: string;
  toolName: string;
  description?: string;
  defaultInput?: Record<string, unknown>;
  // Set by adoptCatalogWidget once this widget graduates through the PR
  // flow (widget-pr-flow plan §3.4). widgetId is unchanged and still
  // resolves the session draft — this is what lets GET /api/widgets/:id
  // serve the reviewed catalog build instead, with the draft as its
  // fallback if the catalog copy is ever unresolvable.
  catalogRef?: CatalogRef;
}

export interface CatalogRef {
  slug: string;
  version: string;
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
      choices: {levelKey: string; displayName?: string; data: GenericLevelData}[];
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

// Same shape and same reasoning as WIDGET_ID_PATTERN, for a draft level's
// directory under the session's levels/ store (SessionStore.levelDir).
export const LEVEL_ID_MAX_LENGTH = 64;
export const LEVEL_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

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

export type LevelPatch = Partial<Pick<ExistingLevelExperience, 'title'>>;

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
      // Same capture discipline as overrideLevelInstructions/
      // overrideLevelDefinition below — set by
      // AuthoringState.applyCurriculumChange from the widget's descriptor
      // just before the merge, never client-supplied.
      previous?: Partial<WidgetDescriptor>;
    }
  // Same capture discipline as overrideLevelInstructions: `previous` is the
  // experience's own catalogRef (or null, for "wasn't adopted yet") just
  // before this op's merge — server-captured, so a revert restores the
  // exact prior state. catalogRef: null detaches (reverts to the session
  // draft), matching the null-means-delete convention LevelDefinitionPatch
  // already uses.
  | {
      op: 'adoptCatalogWidget';
      experienceId: string;
      catalogRef: CatalogRef | null;
      previous?: CatalogRef | null;
    }
  | {
      op: 'createLevel';
      lessonId: string;
      level: ExistingLevelExperience;
      position: number;
    }
  | {op: 'updateLevel'; experienceId: string; patch: LevelPatch}
  | {
      op: 'overrideLevelInstructions';
      experienceId: string;
      patch: InstructionsPatch;
      // Captured by AuthoringState.applyCurriculumChange at apply time, from
      // whatever the served levelProperties held for each patched field just
      // before the merge — never client-supplied. Lets a revert restore the
      // exact prior text (imported original or an earlier override alike)
      // without replaying the whole log.
      previous?: InstructionsPatch;
    }
  | {
      op: 'overrideLevelDefinition';
      experienceId: string;
      patch: LevelDefinitionPatch;
      previous?: LevelDefinitionPatch;
    }
  // Whole-variant replace for a generic-runtime experience's structured
  // payload — see the identical comment on packages/authoring's changes.ts.
  | {
      op: 'updateGenericLevelData';
      experienceId: string;
      data: GenericLevelData;
      previous?: GenericLevelData;
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
  'adoptCatalogWidget',
  'createLevel',
  'updateLevel',
  'overrideLevelInstructions',
  'overrideLevelDefinition',
  'updateGenericLevelData',
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
  startBlocksXml?: string;
  toolboxBlocksXml?: string;
  solutionBlocksXml?: string;
  recommendedBlocksXml?: string;
  [key: string]: unknown;
}

export type ParseLevelXml = (xml: string) => ParsedLevel;

/** Mirror of @code-dot-org/authoring's LevelFilePatch (writeback/levelFile.ts). */
export interface LevelFilePatch {
  properties?: Record<string, string | null>;
  blocks?: {
    startBlocksXml?: string | null;
    toolboxBlocksXml?: string | null;
    solutionBlocksXml?: string | null;
  };
}

export type PatchLevelFile = (
  originalXml: string,
  patch: LevelFilePatch,
) => string;

/** Mirror of @code-dot-org/authoring's buildNewLevelFile (writeback/levelFile.ts). */
export type BuildNewLevelFile = (rootTag: string, patch: LevelFilePatch) => string;

export interface LoadedCourse {
  course: CourseModel;
  levelProperties: Record<string, Record<string, unknown>>;
  warnings: string[];
}
