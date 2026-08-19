// Hackathon AI Lessons — shared types.
//
// A LessonPlan is plain JSON stored on the server (authored lessons live
// under dashboard/tmp/ai_lessons/, repo-shipped exemplars under
// dashboard/config/ai_lessons/) and rendered by the student page.
//
// Format v2 replaces the flat "checkpoints" array (where every entry was
// a lab surface) with a list of typed "steps":
//
//   - lab:        the student works in a real lab (Web Lab 2 or Music Lab)
//   - panels:     an instructional slide carousel
//   - questions:  free-response / multiple-choice / scale prompts shown
//                 one at a time; every answer is recorded as student input
//
// v1 lesson JSONs (with `checkpoints`) still load through
// normalizeLessonPlan() in lessonFormat.ts.
//
// Several fields below describe mechanics that later phases implement
// (branching via `next`/`goTo`, sandbox sources, starter generation, the
// AI build partner, the project checklist).  They are part of the format
// now so hand-authored exemplar lessons can carry them; the runtime
// ignores what it doesn't support yet.

export type ProjectLabType = 'weblab2' | 'music';

export type StepKind = 'lab' | 'panels' | 'questions';

// Advisory metadata describing the step's place in the lesson arc.  Used
// for grouping and labeling in the student and author UIs, never for
// runtime behavior.
export type StepRole =
  | 'intro'
  | 'interview'
  | 'explore'
  | 'reflection'
  | 'skillBuilding'
  | 'projectCheckpoint'
  | 'checkIn'
  | 'freePlay'
  | 'info';

// One automatic branch on a step, evaluated by the resolver when the
// step completes — after any student-chosen option branch, before the
// `next` pointer.  First matching branch in authored order wins; when
// none match the step falls through to next/array order, so the
// fallthrough path IS the default branch.  A branch-point authoring
// pattern falls out of these fields: a core exercise carries `branches`,
// each branch step's `next` points at the rejoin step.
export interface StepBranch {
  when: BranchCondition;
  goTo: string;
}

// Exactly one condition family per branch.  A condition that can't be
// evaluated (unanswered questions, judge failure) doesn't match.
export interface BranchCondition {
  // Performance on a graded questions step: counts answers that were
  // correct on the first attempt.  Retries still gate the quiz UI; only
  // first tries score.
  score?: {
    questionsStepId: string;
    minFirstTryCorrect?: number;
    maxFirstTryCorrect?: number;
  };
  // An LLM reads the student's recorded inputs for the named step (their
  // answers and AI build prompts) and passes or fails them against this
  // prose criteria.
  aiJudge?: {stepId: string; criteria: string};
}

interface StepBase {
  id: string;
  kind: StepKind;
  // Short student-facing heading, shown in the tutor sidebar.
  title: string;
  role?: StepRole;
  // Consecutive steps sharing a segment id render as one cluster (e.g. a
  // multi-step "HTML tags" skill practice).  Sandbox sources are scoped
  // to the segment so its steps share one throwaway project.
  segment?: {id: string; title: string};
  // Where to go after this step completes.  Default is the next step in
  // the array; 'end' finishes the lesson.  Branch rejoins (9a -> 9c) and
  // early exits set this explicitly.
  next?: string | 'end';
  // Automatic performance branching; see StepBranch.
  branches?: StepBranch[];
}

export interface LabStep extends StepBase {
  kind: 'lab';
  labType: ProjectLabType;
  // What the student should do and any context the AI Tutor needs.
  // Never shown verbatim; the tutor turns it into guidance on the fly.
  description: string;
  // 'tutor': the tutor judges the work against successCriteria and gates
  // advancement.  'none': a Continue button advances (explore/free-play
  // steps); the tutor still chats but never gates.
  validation: 'tutor' | 'none';
  successCriteria?: string;
  // 'project' (default): the lesson-wide project for this lab type, with
  // source carry-over across steps.  'sandbox': an isolated throwaway
  // source scoped to the segment (or this step, if no segment), used for
  // skill practice that shouldn't dirty the student's project.
  sourceMode?: 'project' | 'sandbox';
  // Instruction for generating this student's starting source when they
  // first arrive, personalized with their recorded answers.  Natural
  // language; the generator receives all student inputs alongside it.
  starterPrompt?: string;
  // Literal starting files (filename -> contents) for hand-authored
  // starters, e.g. a sandbox with planted bugs.  Wins over starterPrompt.
  starterFiles?: {[filename: string]: string};
  // Whether the student can prompt the AI build partner to write code
  // into this step's source: 'presets' offers presetPrompts to pick
  // from, 'free' adds a free-form prompt box.  Default 'off'.
  aiPrompting?: 'off' | 'presets' | 'free';
  presetPrompts?: string[];
  // The lab mounts read-only: the student sees code and preview but
  // can't edit (AI showcase steps).  Rides the synthetic channel's
  // frozen flag, which lab2/codebridge already honor.
  readOnly?: boolean;
  // Pre-fills the build partner's free-form prompt box so the student
  // arrives with a working prompt to fire or tweak.  Plain text — the
  // build personalizes via the student's recorded answers regardless.
  promptPrefill?: string;
  // Authored observation rubric.  When present, completing this step
  // triggers an LLM observation of HOW the student worked (their
  // prompts, attempts, final work) scored against this prose — e.g.
  // "note which planted bugs got fixed and how targeted the prompts
  // were".  Stored on the progress snapshot; teacher-facing.
  rubric?: string;
}

export interface PanelSlide {
  caption: string;
  // Optional illustration shown behind the caption.  Populated either by
  // the AI image generator (uploaded to /level_assets) or by the author
  // pasting a URL directly.
  imageUrl?: string;
}

export interface PanelsStep extends StepBase {
  kind: 'panels';
  panels: PanelSlide[];
}

export type QuestionType = 'freeResponse' | 'multipleChoice' | 'scale';

// One condition set against the student's recorded answers.  All fields
// present in a rule must hold (AND); a rule list on an option matches
// when any rule does (OR).  Rules reference answers by question id.
export interface RecommendRule {
  questionId: string;
  // Multiple choice: the student chose this option (single or check-all).
  answeredOptionId?: string;
  // Graded questions: the latest outcome equals this.
  outcome?: 'correct' | 'incorrect';
  // Graded questions: took at least this many submissions (catches
  // struggled-then-correct).
  minAttempts?: number;
  // Scale questions.
  scaleAtMost?: number;
  scaleAtLeast?: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  // Marks the right answer(s) when the question is validation: 'key'.
  correct?: boolean;
  // Branching: selecting this option routes the lesson to the given step
  // id after the questions step completes.
  goTo?: string;
  // Adaptive suggestion: when any rule matches the student's recorded
  // answers, the resolver highlights this option ("Suggested").  The
  // first matching option in authored order wins.  All options always
  // stay available — a suggestion is never a gate.
  recommendWhen?: RecommendRule[];
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  // freeResponse only: hint text shown in the empty input.
  placeholder?: string;
  // multipleChoice only.
  options?: QuestionOption[];
  multiSelect?: boolean;
  // scale only.
  scale?: {min: number; max: number; minLabel?: string; maxLabel?: string};
  // Absent: the answer is recorded and the student advances freely
  // (surveys, project inputs, check-ins).  'key': multiple choice with
  // correct option(s).  'tutor': the tutor judges a free response
  // against successCriteria.
  validation?: 'key' | 'tutor';
  successCriteria?: string;
}

export interface QuestionsStep extends StepBase {
  kind: 'questions';
  // Optional context for the AI Tutor about why we're asking.
  description?: string;
  questions: Question[];
  // A hub presents its (single) multiple-choice question repeatedly:
  // spokes route back here via `next`, visited options render as done,
  // and one option routes onward.  Runtime support lands with branching.
  hub?: boolean;
}

export type Step = LabStep | PanelsStep | QuestionsStep;

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface LessonPlan {
  // 2 = step-based format.  Absent means a v1 (checkpoints) JSON, which
  // normalizeLessonPlan() migrates on load.
  formatVersion?: number;
  id?: string;
  title: string;
  objective: string;
  steps: Step[];
  // Project checklist shown during project steps; the tutor reports
  // per-item progress.  Optional; runtime support lands in a later phase.
  checklist?: ChecklistItem[];
  authorInputs: {
    // The free-text prompt the author originally typed.  Kept so the
    // author can tweak the prompt and regenerate later.
    prompt: string;
  };
  // Set server-side for repo-shipped lessons, which can't be edited or
  // deleted through the UI.
  builtin?: boolean;
}

export interface LessonIndexEntry {
  id: string;
  title?: string;
  objective?: string;
  updated_at?: string;
  builtin?: boolean;
}

export function isLabStep(step: Step): step is LabStep {
  return step.kind === 'lab';
}

// Whether the lesson checklist is shown (and tutor-evaluated) on this
// step: project-mode lab steps only — sandboxes and question surfaces
// aren't about the project, so the checklist would be noise there.
export function stepShowsChecklist(lesson: LessonPlan, step: Step): boolean {
  return (
    (lesson.checklist || []).length > 0 &&
    step.kind === 'lab' &&
    step.sourceMode !== 'sandbox'
  );
}

export function isQuestionsStep(step: Step): step is QuestionsStep {
  return step.kind === 'questions';
}

// Whether a step id names a sandbox-mode lab step.  Inputs recorded on
// those steps came from practice exercises (fictional brands, planted
// bugs), so AI contexts must not mistake them for the student's own
// project content.
export function isSandboxStep(lesson: LessonPlan, stepId: string): boolean {
  const step = lesson.steps.find(s => s.id === stepId);
  return step?.kind === 'lab' && step.sourceMode === 'sandbox';
}
