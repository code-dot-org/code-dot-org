/**
 * Types for the guided-lesson hackathon prototype.
 *
 * The premise: every "level type" we have today (multiple choice, free response,
 * predict, lab levels, video levels, instruction panels) collapses into a single
 * sequence of `LessonStep`s, each surfaced by an AI Tutor voice in the same chat.
 *
 * A LessonStep is what the tutor "says next." Its `input` describes how the
 * student responds — buttons, a text field, an interactive lab, or just "continue."
 * Its `stage` describes what fills the right-hand canvas while the step is active.
 */

import type {AiTrainerStageConfig} from './AiTrainerLabStage';
import type {SolutionCheck} from './checkLabSolution';
import type {DatasciStageConfig} from './DatasciLabStage';
import type {MazeStageConfig} from './MazeLabStage';

/**
 * Each step's stage owns the right-hand canvas. The labs (music/maze/datasci/
 * ai-trainer) speak for themselves. The other kinds are *concept-teaching*
 * visualizations built into the studio, deliberately tailored to the
 * misconceptions K-5 students hit on loops + conditions.
 */
export type StageVisual =
  | {kind: 'none'}
  | {kind: 'note'; title: string; body: string}
  | {kind: 'youtube'; youTubeId: string; title?: string}
  | {kind: 'image'; src: string; alt: string}
  // Concept primitives. See `stage-primitives/` for implementations.
  | {kind: 'loop-collapse'}
  | {kind: 'unroll-tape'}
  | {kind: 'question-vs-action'}
  | {kind: 'condition-fork'}
  | {kind: 'pegman-step-trace'; mazeConfig: MazeStageConfig}
  | {kind: 'reflection-invitation'; prompt: string}
  | {kind: 'lesson-celebrate'; summary?: string[]}
  // MC owned by the stage — GuidedLesson injects this at render time with
  // the active step's question + options + click handler. Authors never set
  // this directly in `data.ts`; they set `stage.kind: 'multiple-choice-stage'`
  // as a marker and the host fills the rest.
  | {
      kind: 'multiple-choice-stage';
      question: string;
      options: {id: string; label: string; isCorrect?: boolean}[];
      onChoose: (option: {
        id: string;
        label: string;
        isCorrect?: boolean;
      }) => void;
    }
  // Author-facing marker that says "render this step's MC on the stage."
  // GuidedLesson swaps it for the resolved `multiple-choice-stage` above.
  | {kind: 'multiple-choice-stage-slot'}
  // AI for Oceans visual primitives.
  | {kind: 'label-bucket'}
  | {kind: 'data-diet-plate'}
  | {kind: 'feed-mirror'}
  // Labs — leave alone; they own the canvas when shown.
  | {kind: 'music-lab'}
  | {kind: 'maze-lab'; config: MazeStageConfig}
  | {kind: 'datasci-lab'; config: DatasciStageConfig}
  | {kind: 'ai-trainer-lab'; config: AiTrainerStageConfig}
  | {
      kind: 'oceans-lab';
      /**
       * Activity mode. `fishvtrash` is the entry-level binary classifier;
       * `creaturesvtrash` is the bias-trap variant with varied creatures.
       */
      appMode: 'fishvtrash' | 'creaturesvtrashdemo' | 'creaturesvtrash';
    };

export interface MultipleChoiceOption {
  id: string;
  label: string;
  isCorrect: boolean;
  /** Tutor's response when the student picks this option. */
  feedback: string;
}

interface BaseStep {
  id: string;
  /** What the AI Tutor says when this step becomes active. */
  tutorMessage: string;
  /** What appears in the right-hand stage while this step is active. */
  stage: StageVisual;
}

export type LessonStep =
  | (BaseStep & {
      kind: 'concept';
      /** Label on the "continue" button. Defaults to "Got it". */
      continueLabel?: string;
    })
  | (BaseStep & {
      kind: 'multiple-choice';
      options: MultipleChoiceOption[];
      /** If true, the student can keep trying after an incorrect answer. */
      allowRetry?: boolean;
    })
  | (BaseStep & {
      kind: 'free-response';
      placeholder: string;
      /** Tutor's response after the student submits. */
      acknowledgement: string;
    })
  | (BaseStep & {
      kind: 'lab';
      /** Label on the "I'm done, continue" button shown after the lab step. */
      continueLabel?: string;
      /** Tutor's response when the lab task is considered complete. */
      successMessage: string;
      /**
       * Optional deterministic code-check that gates advancement. Walks
       * the live Blockly workspace and evaluates authored rules (required
       * block types, forbidden block types, minimum counts). If any rule
       * fails, the first failure's hint is appended to the chat as a tutor
       * turn and the student stays on the same step. If all rules pass,
       * the lesson advances. See `./checkLabSolution.ts`.
       */
      solutionCheck?: SolutionCheck;
    })
  | (BaseStep & {
      kind: 'celebrate';
      summary: string[];
    });

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  steps: LessonStep[];
}

/**
 * Each turn in the conversation log. Tutor turns may carry a `stepId` so the UI
 * can render them as part of the active step (e.g. with a fresh input prompt).
 */
export type ChatTurn =
  | {role: 'tutor'; body: string; stepId?: string}
  | {role: 'student'; body: string; stepId?: string};
