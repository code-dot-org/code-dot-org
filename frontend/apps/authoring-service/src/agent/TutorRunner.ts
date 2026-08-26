import type {AuthoringState} from '../state/AuthoringState.js';

export interface TutorEvent {
  kind: 'widget_event' | 'learner_message' | 'experience_shown';
  experienceId?: string;
  text?: string;
  data?: unknown;
}

export type TutorAction =
  | {type: 'hint'; text: string}
  | {
      type: 'select_experience';
      experienceId: string;
      input?: Record<string, unknown>;
    }
  | {type: 'none'; text?: string};

export interface TutorTurnInput {
  lessonId: string;
  transcript: TutorEvent[];
  state: AuthoringState;
}

/**
 * The seam the learner-time tutor implements. A tutor may only select or
 * configure experiences the author already published, so it returns an action
 * rather than mutating state; the deterministic path ignores it entirely.
 */
export interface TutorRunner {
  runTurn(input: TutorTurnInput): Promise<TutorAction>;
}

/** Placeholder runner: keeps the learner path deterministic. */
export class EchoTutorRunner implements TutorRunner {
  async runTurn(): Promise<TutorAction> {
    return {type: 'none', text: 'tutor not wired'};
  }
}
