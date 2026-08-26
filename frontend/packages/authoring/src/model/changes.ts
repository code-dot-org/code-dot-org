import type {CourseModel, Experience, Lesson, Unit} from './types';
import type {WidgetDescriptor} from './widget';

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
    }
);
