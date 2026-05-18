// Shape of a lesson row inside the page payload, mirrors the Ruby
// Lesson#summarize_for_unit_generate output.
export interface SerializedLesson {
  id: number;
  name: string;
  key: string;
  generateOutline?: string | null;
  lessonEditPath: string;
  lessonGeneratePath: string;
}

export interface ExistingUnitData {
  id: number;
  name: string;
  title: string;
  lessons: SerializedLesson[];
  // True when the unit has more than one user-facing lesson group; the
  // controller refuses bulk-write in that case so the UI degrades to a
  // read-only banner.
  multipleLessonGroups: boolean;
  editUnitUrl: string;
  // Persisted unit-level outline prompt. The page restores it on reload
  // so the levelbuilder doesn't have to retype it.
  generateOutline?: string | null;
}

// One row in the editable card list. Pre-existing lessons round-trip via
// `id`; freshly-added cards leave `id` undefined and the server creates
// the underlying Lesson on save.
export interface LessonSpec {
  // Stable key for the React list; not the lesson's key (which the user
  // can edit for new cards).
  reactKey: string;
  id?: number;
  key: string;
  name: string;
  generateOutline: string;
  // Snapshot of generateOutline at load time, used to decide whether to
  // resend the value (so existing prompts don't get accidentally cleared
  // by a no-op save).
  originalGenerateOutline?: string;
  // For existing lessons only.
  lessonEditPath?: string;
  lessonGeneratePath?: string;
  // True when this existing lesson loaded with no generateOutline. The
  // card surfaces a "created separately" note rather than an empty prompt
  // box masquerading as an unfinished outline.
  createdSeparately?: boolean;
}

export interface UnitGenerationSummary {
  lessons: {
    name: string;
    lessonGeneratePath: string;
    lessonEditPath: string;
    createdSeparately: boolean;
    isNew: boolean;
  }[];
  // Total lessons saved (existing + new).
  total: number;
}
