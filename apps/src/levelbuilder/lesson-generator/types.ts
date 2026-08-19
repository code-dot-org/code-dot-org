// Lab types the AI generator supports. A new lab needs an entry here,
// a row in each map below, and a generator under ai/.
export const SUPPORTED_LAB_TYPES = [
  'panels',
  'weblab2',
  'pythonlab',
  'ailab',
  'aichat',
  'sketchlab',
  'multi',
  'match',
  'freeResponse',
  'bubbleChoice',
] as const;

export type LabType = (typeof SUPPORTED_LAB_TYPES)[number];

// Rails STI class name per lab type, for /levels create and lookup.
export const RAILS_TYPE_BY_LAB: Record<LabType, string> = {
  panels: 'Panels',
  weblab2: 'Weblab2',
  pythonlab: 'Pythonlab',
  ailab: 'Ailab',
  aichat: 'Aichat',
  sketchlab: 'Sketchlab',
  multi: 'Multi',
  match: 'Match',
  freeResponse: 'FreeResponse',
  bubbleChoice: 'BubbleChoice',
};

// Lab types saved as parsed DSL text (dsl_text) rather than serialized
// JSON properties; createOrFindLevel and updateLevelProperty branch on this.
export const DSL_LAB_TYPES: readonly LabType[] = [
  'multi',
  'match',
  'bubbleChoice',
];

// Lab types allowed as Bubble Choice sublevels: no nesting, and
// assessments read poorly as "pick one activity to try".
export const BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES: readonly LabType[] = [
  'panels',
  'weblab2',
  'pythonlab',
  'ailab',
  'aichat',
  'sketchlab',
];

// Per-lab prose the outline prompt and schema describes are composed from.
export interface LabTypePromptInfo {
  promptLabel: string;
  // Bullet body lines, emitted verbatim under promptLabel.
  promptDescription: string[];
  // Phrase for the "Choose X for …" summary line.
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
  pythonlab: {
    promptLabel: 'Pythonlab',
    promptDescription: [
      'a hands-on Python exercise where the student edits starter code and',
      'runs it in the browser (console output, input(), and matplotlib',
      'work; no network or third-party packages). Use for text/console',
      'programming practice — not for building web pages.',
    ],
    chooseFor: 'Python-coding practice',
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
  freeResponse: {
    promptLabel: 'FreeResponse',
    promptDescription: [
      'a written-response prompt the student answers in a text box. Use',
      'for reflection, prediction, or explain-your-thinking checks where',
      'a fixed answer set would not fit. Content will be a STUB the',
      'curriculum author rewrites.',
    ],
    chooseFor: 'written reflection / open-ended assessment',
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

// Inverse of RAILS_TYPE_BY_LAB; a miss means the level type is
// unsupported, not a casing problem.
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
  // Defaults on for fresh rows and rows whose description drifted from
  // lastGeneratedDescription; the user can override.
  generate: boolean;
  lastGeneratedDescription?: string;
  // aichat only: preset driving generation. Outline AI suggests one; the
  // per-card dropdown overrides.
  aichatPreset?: string;
  // weblab2 only: specs sharing a non-empty id get one generated template
  // level ("<prefix>-template-<groupId>") via project_template_level_name.
  templateGroup?: string;
  // bubbleChoice only: sublevel cards, each a LevelSpec whose labType is
  // in BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES.
  sublevels?: LevelSpec[];
  // Set when this card is a level already in the lesson; restores it to
  // the same activity/section on save.
  existing?: ExistingLevelRef;
  // Set when the lab type is unsupported: card renders read-only so the
  // user can still see and reorder around it.
  unsupportedType?: string;
}

export interface ExistingLevelRef {
  activityIndex: number;
  sectionIndex: number;
  // Sent back verbatim when the spec wasn't regenerated, so the server
  // keeps the same row.
  scriptLevel: SerializedScriptLevel;
}

export interface ExistingLessonData {
  id: number;
  name: string;
  lessonPath: string;
  editLessonUrl: string;
  activities?: SerializedActivity[];
  // Outline from the last "Generate outline" run; restored on reload.
  generateOutline?: string;
  // Weblab2 channel whose project is the app the lesson builds toward;
  // its source feeds the per-level prompts as context.
  generateProjectChannelId?: string | null;
  // Unit-scope context so lesson prompts can anchor against the unit.
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
  // Set by ScriptLevel#summarize_for_lesson_edit to pre-populate rows.
  type?: string;
  generateOutline?: string | null;
  // aichat only: preset id used at generation time; unknown ids reset to
  // the default on reload.
  generateAichatPreset?: string | null;
  // BubbleChoice parents only: nested sublevels in picker order.
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
  // weblab2 template levels created this run — separate from `created`
  // because they're standalone records outside the activity tree.
  templates?: {name: string; editUrl: string}[];
}
