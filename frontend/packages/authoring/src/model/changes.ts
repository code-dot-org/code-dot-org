import type {
  CourseModel,
  Experience,
  ExistingLevelExperience,
  InstructionsPatch,
  LevelDefinitionPatch,
  Lesson,
  Unit,
} from './types';
import type {CatalogRef, WidgetDescriptor} from './widget';

// Creatable subsets: a stub is the parent object minus its children array —
// the array a create op is itself populating.
export type CourseStub = Omit<CourseModel, 'units'>;
export type UnitStub = Omit<Unit, 'lessons'>;
export type LessonStub = Omit<Lesson, 'experiences'>;

// Patchable scalar fields of a lesson — everything but its identity
// (id/origin/lessonKey) and its experiences, which move through their own
// ops (insertExperience/removeExperience/moveExperience).
export type LessonPatch = Partial<
  Omit<Lesson, 'id' | 'origin' | 'lessonKey' | 'experiences'>
>;

// title/markdown apply wherever an experience carries them: ContentExperience
// has both directly; an ExistingLevelExperience's generic data carries
// markdown for the multi/match/markdown GenericLevelData variants. A patch
// field that doesn't apply to the target experience's kind is a no-op, not
// an error — see applyChange.
export interface ContentPatch {
  title?: string;
  markdown?: string;
}

// A gate-verified AI-authored level is already a fully-resolved
// ExistingLevelExperience by the time it reaches the change log (the
// service registers its LevelProperties and assigns levelNumericId before
// building this) — distinct from insertExperience so a production write
// adapter can special-case "this needs a real new Level row" versus
// "attach what already exists".
export type LevelPatch = Partial<Pick<ExistingLevelExperience, 'title'>>;

/**
 * Every mutation — agent tool call or direct author manipulation — appends
 * one entry. Existing ids stay existing ids; new objects get `draft:` ids.
 * The log is the inspectable seam where a production Levelbuilder/Rails
 * write adapter would attach.
 */
export type CurriculumChange = {
  seq: number;
  at: string;
  actor: 'agent' | 'author';
} & (
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
      // overrideLevelDefinition below — server-captured, never
      // client-supplied.
      previous?: Partial<WidgetDescriptor>;
    }
  // Attaches (or, with catalogRef: null, detaches) a graduated catalog
  // build to a widget experience — widget-pr-flow plan §3.4/Pass 6. Same
  // capture discipline as overrideLevelInstructions: `previous` is the
  // experience's own catalogRef (or null, for "wasn't adopted yet")
  // just before this op's merge, captured server-side, so a revert
  // restores the exact prior state including "not adopted at all".
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
  // Applies to any existingLevel experience — imported (lb:) or draft alike.
  // Draft Maze levels also accept instructions through update_level's
  // MazeLevelDefinitionPatchSchema (grid/blocks/instructions together, gated
  // by the solvability check); this op is the lighter, type-agnostic path
  // used uniformly by the manual UI and the agent tool, and the one the two
  // coexist rather than one delegating to the other.
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
  // Same shape and capture discipline as overrideLevelInstructions, for the
  // visual level editor. Applies uniformly to an imported (lb:) or draft
  // existingLevel experience — see LevelDefinitionPatch.
  | {
      op: 'overrideLevelDefinition';
      experienceId: string;
      patch: LevelDefinitionPatch;
      previous?: LevelDefinitionPatch;
    }
);
