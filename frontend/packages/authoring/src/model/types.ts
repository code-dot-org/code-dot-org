// Domain model contract. Transcribed from docs/prototypes/author-mode.md
// (repo root) — that doc is authoritative; keep this file in sync with it.

export type Origin = 'levelbuilder' | 'draft';
// Draft ids are `draft:<uuid>`; imported ids embed the real Levelbuilder keys.

export interface CourseModel {
  id: string; // course name, e.g. 'k5-ai-data-2024', or draft:<uuid>
  offeringKey?: string; // course_offerings key, e.g. 'k5-ai-data'
  displayName: string;
  gradeLevels?: string;
  origin: Origin;
  units: Unit[];
}

export interface Unit {
  id: string; // script name, e.g. 'k5-ai-data-2024', or draft:<uuid>
  displayName: string;
  origin: Origin;
  overview?: string; // markdown
  lessons: Lesson[];
}

export interface Lesson {
  id: string; // `lb:<script>:<lessonKey>` or draft:<uuid>
  lessonKey?: string; // real Levelbuilder lesson.key when imported
  displayName: string;
  origin: Origin;
  goal?: string; // pedagogical intent (outline-first authoring)
  durationMinutes?: number;
  overview?: string; // learner-facing markdown (student_overview)
  outline?: string[]; // planned high-level sequence, pre-realization
  expectedOutcome?: string;
  experiences: Experience[];
  adaptivePolicy?: AdaptivePolicy;
}

interface ExperienceBase {
  id: string; // `lb:<levelKey>` or draft:<uuid>
  origin: Origin;
  title?: string;
}

/** Learner-facing instructional content authored directly (markdown). */
export interface ContentExperience extends ExperienceBase {
  kind: 'content';
  markdown: string;
}

/** A real Levelbuilder level, identity preserved. */
export interface ExistingLevelExperience extends ExperienceBase {
  kind: 'existingLevel';
  levelKey: string; // real level name, e.g. 'Oceans_FishVTrash_2024'
  levelType: string; // 'Fish' | 'Music' | 'Multi' | 'Match' | 'External' | 'StandaloneVideo' | 'LevelGroup' | 'BubbleChoice' | 'GamelabJr' | ...
  runtime: 'labhost' | 'generic' | 'unsupported';
  labKey?: 'oceans' | 'music' | 'maze'; // LAB_REGISTRY key when runtime is labhost
  levelNumericId?: number; // synthetic id for the LevelProperties wire shape
  data?: GenericLevelData; // structured payload for generic renderers
  // Author-edited instructions layered on top of whatever the imported
  // source (or draft definition) carries — never a rewrite of that source.
  // The authoring service also folds this onto the served LevelProperties
  // entry for levelNumericId, so a mounted lab sees it exactly like it would
  // see the original short_instructions/long_instructions.
  instructionsOverride?: InstructionsPatch;
  // Same idea as instructionsOverride, for the visual level editor (grid,
  // blocks, start direction, ...) — see LevelDefinitionPatch.
  definitionOverride?: LevelDefinitionPatch;
}

export interface InstructionsPatch {
  shortInstructions?: string;
  longInstructions?: string;
}

// Patch onto a maze-family level's served LevelProperties entry, keyed
// exactly like that wire record (mixed snake_case/camelCase — see
// docs/prototypes/author-mode-level-editor.md §1.3) rather than
// MazeLevelDefinition: the visual editor's output (arbitrary Blockly
// workspaces, any Cell subclass field) is strictly richer than that typed
// shape can express. `null` means "delete this key" — the server captures
// `previous` from whatever the served entry held before the patch, and a
// field the level never had must round-trip back to absent, not `''`, on
// revert.
export interface LevelDefinitionPatch {
  serialized_maze?: string | null;
  maze?: string | null;
  // Legacy per-cell value grid (see editing.ts's serializeMapDraft) —
  // written alongside serialized_maze/maze so any consumer that still
  // reads the pre-serialized_maze wire shape sees the same paint.
  initial_dirt?: string | null;
  startBlocksXml?: string | null;
  toolboxBlocksXml?: string | null;
  solutionBlocksXml?: string | null;
  startDirection?: string | null;
  ideal?: string | null;
  // 'true' when solutionBlocksXml was captured from a passing run of the
  // exact grid/toolbox/start direction this patch also carries (Author
  // Mode Pass D) — the author-run proof LevelRail's solution status reads.
  // Never client-set to 'false': AuthoringState's mergeDefinitionOverride
  // forces it false server-side whenever a patch touches the environment
  // (serialized_maze/maze/toolboxBlocksXml/startDirection) without also
  // supplying a fresh solutionVerified — the "cheap sound rule" that keeps
  // a stale solution from reading as proven after the puzzle changed
  // underneath it.
  solutionVerified?: string | null;
  // Karel-family goal fields (editing.ts's getGoalFields) — not read by
  // this prototype's ported engine (win is still position-only), but real
  // production fields and what checkImportedMazeLevel's goal-consistency
  // check validates a finish-less grid against.
  nectar_goal?: string | null;
  honey_goal?: string | null;
  min_collected?: string | null;
  // Bee only — redWithNectar/purpleNectarHidden (Bee.ts's
  // defaultFlowerColor_). Wire key is snake, matching the served
  // properties' raw `flower_type`, not the engine-facing `flowerType`
  // buildMazeLevelProperties also sets — see AuthoringState's
  // CAMEL_SNAKE_TWINS for how a patch on this key keeps both in sync.
  flower_type?: string | null;
}

/** Agent-created executable learner content, sandboxed. */
export interface WidgetExperience extends ExperienceBase {
  kind: 'widget';
  widgetId: string; // addresses source + descriptor in the widget store
  toolName: string; // MCP tool name, e.g. 'present_balance_the_data'
  description?: string;
  defaultInput?: Record<string, unknown>;
}

export type Experience =
  | ContentExperience
  | ExistingLevelExperience
  | WidgetExperience;

/** Author-defined constraints the learner-time tutor operates inside. */
export interface AdaptivePolicy {
  tutorGuidance?: string; // author-written guidance
  alternatives?: Record<string, string[]>; // experienceId -> authored alternates
  allowRepeat?: boolean;
}

/**
 * Structured content of simple level types the prototype renders without
 * their Rails renderers. See the runtime-mapping table in
 * docs/prototypes/author-mode.md for which imported level types produce
 * which variant.
 */
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
