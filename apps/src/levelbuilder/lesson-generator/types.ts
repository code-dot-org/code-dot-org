import {AppName} from '@cdo/apps/lab2/types';

// Lab types the AI generator supports. Add an entry here and a matching
// generator in aiGeneration.ts to add a new lab. SUPPORTED_LAB_TYPES is
// `readonly AppName[]`-typed so the entries are checked against the
// canonical Lab2 lab list.
export const SUPPORTED_LAB_TYPES = [
  'panels',
  'weblab2',
] as const satisfies readonly AppName[];

export type LabType = (typeof SUPPORTED_LAB_TYPES)[number];

// Rails STI class name corresponding to each supported AppName. Used when
// POSTing to /levels (the Rails create endpoint takes :type as the STI
// name) and when filtering a search by level_type.
export const RAILS_TYPE_BY_LAB: Record<LabType, string> = {
  panels: 'Panels',
  weblab2: 'Weblab2',
};

// Inverse of RAILS_TYPE_BY_LAB. ScriptLevel#summarize_for_lesson_edit
// returns level.type as the Rails STI name; convert it to AppName at the
// page boundary.
export function labTypeFromRailsType(
  railsType: string | undefined
): LabType | undefined {
  if (!railsType) return undefined;
  const lower = railsType.toLowerCase();
  return (SUPPORTED_LAB_TYPES as readonly string[]).includes(lower)
    ? (lower as LabType)
    : undefined;
}

export interface LevelSpec {
  key: string;
  id: string;
  labType: LabType;
  description: string;
  // Whether the next Generate run should run the AI for this level. Defaults
  // to true for fresh rows and any row whose description has drifted from
  // the description recorded at the last successful generation.
  generate: boolean;
  // The trimmed description as of the last successful generation, used to
  // decide whether to default `generate` on or off as the user edits.
  // Undefined means the level has never been generated.
  lastGeneratedDescription?: string;
  // Set if this card represents a level already in the lesson. Carries the
  // information needed to put the level back in the same activity/section
  // on save while honouring the new order.
  existing?: ExistingLevelRef;
  // Set if the existing level uses a lab type the generator doesn't
  // support. The card is rendered read-only and never generated; it's only
  // here so the user can see and reorder around it.
  unsupportedType?: string;
}

export interface ExistingLevelRef {
  activityIndex: number;
  sectionIndex: number;
  // The full original script_level summary, sent back verbatim when this
  // spec wasn't (re)generated, so the server keeps the same row.
  scriptLevel: SerializedScriptLevel;
}

export interface ExistingLessonData {
  id: number;
  name: string;
  lessonPath: string;
  editLessonUrl: string;
  activities?: SerializedActivity[];
  // Persisted outline that drove the last "Generate outline" run (if any).
  // Stored on the lesson so reopening /generate restores it.
  generateOutline?: string;
  // Optional Weblab2 channel id whose project source describes the
  // final app this lesson is building toward. When set, the per-level
  // AI prompts get the project's MultiFileSource as additional context.
  generateProjectChannelId?: string | null;
  // Outer-scope context piped down from the Unit this lesson belongs to,
  // so the lesson-level AI prompts can anchor against the unit identity
  // and the unit-wide outline the curriculum author wrote on /s/[unit]/generate.
  unitName?: string;
  unitOutline?: string;
  // Lesson objectives, as returned by Lesson#summarize_for_lesson_edit.
  // Drives the practice-problem generator: each generated problem is
  // associated with exactly one objective via its `key`.
  objectives?: LessonObjective[];
  // The lesson's student_overview text, used as additional context when
  // generating practice problems.
  studentOverview?: string;
}

export interface LessonObjective {
  id: number;
  description: string;
  key: string;
}

// Practice problem types as understood by the seed schema. Mirrors
// SharedConstants::PRACTICE_PROBLEM_TYPES on the Rails side. Adding a
// type here also requires a matching generator schema in
// ai/practiceProblems.ts and a matching editor in
// components/practiceProblemEditors/.
export const PRACTICE_PROBLEM_TYPES = [
  'multiple_choice_single_select',
  'multiple_choice_multi_select',
  'match',
  'scramble',
  'sort',
] as const;

export type PracticeProblemType = (typeof PRACTICE_PROBLEM_TYPES)[number];

export interface MultiChoiceSolutionItem {
  option: string;
  correct: boolean;
}

export interface MatchSolutionItem {
  option: string;
  correct: string;
}

export interface OrderedSolutionItem {
  option: string;
  correct: number;
}

export type SolutionItem =
  | MultiChoiceSolutionItem
  | MatchSolutionItem
  | OrderedSolutionItem;

// A single (objective × type) row in the practice-problem generator. The
// curric author can add, remove, edit, and regenerate one of these at a
// time; Save sends each row as a single POST to /practice_problems.
export interface PracticeProblemSpec {
  // Stable local key, used for React identity and to track this row
  // through the generation/save loop. Distinct from the seed `key` (below)
  // which is persisted and must be globally unique across the corpus.
  uiKey: string;
  // The seed key for this problem. Auto-derived from prefix+objective+type
  // on first generation; editable by the user before save.
  key: string;
  objectiveKey: string;
  problemType: PracticeProblemType;
  problemText: string;
  solution: SolutionItem[];
  // Whether the next Generate run should AI-fill this row. Defaults to
  // true for fresh rows; false after a successful generation. Mirrors
  // LevelSpec.generate.
  generate: boolean;
  // Whether this row should be active when seeded. Maps to the
  // `active` column on PracticeProblem.
  active: boolean;
  // Set after a successful save so the UI can show "Saved" status and
  // suppress repeat saves of the same content.
  savedAt?: number;
}

// The shape returned by Lesson#summarize_for_lesson_edit, narrowed to the
// fields we round-trip through the lesson update endpoint.
export interface SerializedActivity {
  id?: number;
  position: number;
  name?: string;
  duration?: number;
  activitySections: SerializedActivitySection[];
}

export interface SerializedActivitySection {
  id?: number;
  position: number;
  name?: string;
  description?: string;
  duration?: number;
  remarks?: string;
  progressionName?: string;
  tips?: object[];
  scriptLevels: SerializedScriptLevel[];
}

export interface SerializedScriptLevel {
  id?: string;
  activitySectionPosition: number;
  assessment?: boolean;
  bonus?: boolean;
  challenge?: boolean;
  variants?: object[];
  levels: SerializedLevel[];
}

export interface SerializedLevel {
  id: string;
  name: string;
  url?: string;
  // Set by Level#summarize_for_lesson_edit (per script_level.rb).
  // The /generate page uses these to pre-populate level rows for existing
  // levels in the lesson.
  type?: string;
  generateOutline?: string | null;
}

export type ProgressPhase =
  | 'creating'
  | 'planning'
  | 'generating-image'
  | 'saving-properties'
  | 'attaching';

export interface ProgressUpdate {
  levelIndex: number;
  totalLevels: number;
  levelName: string;
  phase: ProgressPhase;
  detail?: string;
}

export interface GenerationSummary {
  created: {name: string; editUrl: string}[];
  failed: {name: string; error: string}[];
}
