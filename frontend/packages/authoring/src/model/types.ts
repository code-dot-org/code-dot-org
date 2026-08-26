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
  labKey?: 'oceans' | 'music'; // LAB_REGISTRY key when runtime is labhost
  levelNumericId?: number; // synthetic id for the LevelProperties wire shape
  data?: GenericLevelData; // structured payload for generic renderers
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
      choices: {levelKey: string; displayName?: string}[];
    }
  | {type: 'opaque'; levelType: string; properties?: Record<string, unknown>};
