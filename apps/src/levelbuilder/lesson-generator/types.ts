// Lab types the AI generator supports. Add an entry here and a matching
// generator under ai/ to add a new lab. The list mixes Lab2 lab ids
// (panels, weblab2, ailab, aichat) with the assessment types Multi and
// Match — the latter are not Lab2-backed but the generator treats them
// as first-class slots in the lesson activity tree.
export const SUPPORTED_LAB_TYPES = [
  'panels',
  'weblab2',
  'ailab',
  'aichat',
  'sketchlab',
  'multi',
  'match',
  'bubbleChoice',
] as const;

export type LabType = (typeof SUPPORTED_LAB_TYPES)[number];

// Rails STI class name corresponding to each supported lab type. Used
// when POSTing to /levels (the Rails create endpoint takes :type as
// the STI name) and when filtering a search by level_type.
export const RAILS_TYPE_BY_LAB: Record<LabType, string> = {
  panels: 'Panels',
  weblab2: 'Weblab2',
  ailab: 'Ailab',
  aichat: 'Aichat',
  sketchlab: 'Sketchlab',
  multi: 'Multi',
  match: 'Match',
  bubbleChoice: 'BubbleChoice',
};

// Lab types whose level content is a parsed DSL text file (.multi /
// .match / .bubble_choice under dashboard/config/scripts) rather than
// serialized JSON properties. createOrFindLevel and updateLevelProperty
// have a dsl_text branch for these; the per-level generators render
// structured AI output into the DSL syntax before saving.
export const DSL_LAB_TYPES: readonly LabType[] = [
  'multi',
  'match',
  'bubbleChoice',
];

// Lab types that can appear as sublevels of a Bubble Choice parent.
// Bubble Choice can't nest inside itself, and assessment types
// (multi/match) read poorly as "pick one activity to try", so they're
// excluded. Keep in sync with the outline schema's sublevel enum.
export const BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES: readonly LabType[] = [
  'panels',
  'weblab2',
  'ailab',
  'aichat',
  'sketchlab',
];

// Per-lab prose used to compose outline prompts and enum descriptions.
// The outline AI is only asked to place lab types listed here; adding a
// new lab means adding a row (plus the runtime pieces in ai/ and
// SUPPORTED_LAB_TYPES). Kept close to the type union so the two evolve
// together.
export interface LabTypePromptInfo {
  // Prompt-bullet label ("Panels", "Web Lab 2", …).
  promptLabel: string;
  // Prompt-bullet body — one or more lines. Included verbatim as bullet
  // continuation lines under promptLabel.
  promptDescription: string[];
  // Phrase used in the "Choose X for …" summary line.
  chooseFor: string;
}

export const LAB_TYPE_INFO: Record<LabType, LabTypePromptInfo> = {
  panels: {
    promptLabel: 'Panels',
    promptDescription: [
      'a short comic-strip-like sequence used for narrative, introduction,',
      'framing, or summarising. No coding.',
    ],
    chooseFor: 'explanation/narrative',
  },
  weblab2: {
    promptLabel: 'Weblab2',
    promptDescription: [
      'a hands-on HTML/CSS/JS exercise where the student edits starter',
      'code.',
    ],
    chooseFor: 'web-coding practice',
  },
  ailab: {
    promptLabel: 'Ailab',
    promptDescription: [
      'a guided ML pipeline where the student picks a dataset, picks',
      'features, trains a model, and inspects accuracy. Use this only when',
      'the lesson is about data, machine learning, bias in data, or model',
      'evaluation — not for general coding.',
    ],
    chooseFor: 'ML pipeline practice',
  },
  aichat: {
    promptLabel: 'Aichat',
    promptDescription: [
      'a chat-with-an-LLM level. Pick a preset via aichatPreset: "explore"',
      'for free-form chat with a persona bot, "tutor" for a skill-guiding',
      'bot, "evaluation" for a bot that evaluates the student\'s work,',
      '"domainExpert" for a subject-constrained bot, "botBuilder" when the',
      'student designs their own bot.',
    ],
    chooseFor: 'talking-to-AI practice',
  },
  sketchlab: {
    promptLabel: 'Sketchlab',
    promptDescription: [
      'an open-ended drawing / annotation level on a blank canvas. Use for',
      'diagramming, marking-up, or free-form visual reflection. Content',
      'will be a STUB: only the instructions are generated, the sketch',
      'canvas itself is left blank for the student to draw.',
    ],
    chooseFor: 'drawing / annotation exercises',
  },
  multi: {
    promptLabel: 'Multi',
    promptDescription: [
      'a multiple-choice question. Use as a quick check-for-understanding',
      'after a concept has been introduced. Content will be a STUB the',
      'curriculum author rewrites.',
    ],
    chooseFor: 'short formative assessments',
  },
  match: {
    promptLabel: 'Match',
    promptDescription: [
      'a matching exercise. Use to connect related concepts, terms-to-',
      'definitions, etc. Content will be a STUB.',
    ],
    chooseFor: 'short formative assessments',
  },
  bubbleChoice: {
    promptLabel: 'BubbleChoice',
    promptDescription: [
      'a picker page where the student picks one of 2-6 sublevel',
      'activities to try. Use when the lesson wants to offer parallel',
      'options (e.g. "pick a project theme") rather than a single linear',
      'step. REQUIRED: emit a `sublevels` array with 2-6 entries in the',
      'order the student sees them.',
    ],
    chooseFor: 'student choice between parallel activities',
  },
};

const LAB_TYPE_BY_RAILS: Record<string, LabType> = Object.fromEntries(
  (Object.entries(RAILS_TYPE_BY_LAB) as [LabType, string][]).map(
    ([lab, sti]) => [sti, lab]
  )
);

// "one, two, three" — for lab-type list phrases in prompts and describes.
export function formatLabTypeList(labs: readonly LabType[]): string {
  return labs.map(t => `"${t}"`).join(', ');
}

// ScriptLevel#summarize_for_lesson_edit returns level.type as the Rails
// STI name; look it up in the inverted RAILS_TYPE_BY_LAB map. Case-
// sensitive on the STI name (e.g. "BubbleChoice") — since RAILS_TYPE_BY_LAB
// is the authoritative map, a mismatch here means the level truly isn't
// a supported type.
export function labTypeFromRailsType(
  railsType: string | undefined
): LabType | undefined {
  if (!railsType) return undefined;
  return LAB_TYPE_BY_RAILS[railsType];
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
  // For aichat levels only: which preset to drive generation with. The
  // outline AI suggests one; the per-card dropdown lets the curriculum
  // author override before generation. Ignored for non-aichat labTypes.
  aichatPreset?: string;
  // For weblab2 levels only: short id that groups multiple cards onto a
  // shared project template. Two or more weblab2 specs with the same
  // non-empty templateGroup get backed by one generated template level
  // (named "<prefix>-template-<groupId>"); each member then carries only
  // its own long_instructions and an exemplar, with project_template_level_name
  // pointing at the template. Empty/absent means "stand alone".
  templateGroup?: string;
  // For bubbleChoice levels only: the nested list of sublevel cards
  // shown as bubbles on the parent's picker page. Each sublevel is a
  // full LevelSpec whose labType is one of BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES.
  // Nested bubbleChoice is not allowed. Ignored for non-bubbleChoice
  // labTypes.
  sublevels?: LevelSpec[];
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
  // Populated for BubbleChoice parents by script_level.rb; each entry
  // is a nested SerializedLevel for one sublevel in picker order.
  sublevels?: SerializedLevel[];
}

export type ProgressPhase =
  | 'creating'
  | 'planning'
  | 'generating-image'
  | 'saving-properties'
  | 'generating-exemplar'
  | 'saving-exemplar'
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
  // Shared weblab2 template levels created this run. Reported separately
  // from `created` because templates don't appear in the lesson's
  // activity tree — they're standalone level records backing one or
  // more lesson members. The Summary dialog links them so the
  // curriculum author can edit the template content by hand.
  templates?: {name: string; editUrl: string}[];
}
