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
import type {DatasciStageConfig} from './DatasciLabStage';
import type {MazeStageConfig} from './MazeLabStage';

export type StageVisual =
  | {kind: 'none'}
  | {kind: 'note'; title: string; body: string}
  | {kind: 'youtube'; youTubeId: string; title?: string}
  | {kind: 'image'; src: string; alt: string}
  | {kind: 'music-lab'}
  | {kind: 'maze-lab'; config: MazeStageConfig}
  | {kind: 'datasci-lab'; config: DatasciStageConfig}
  | {kind: 'ai-trainer-lab'; config: AiTrainerStageConfig};

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
