import {
  ChatHandle,
  ChatTranscript,
} from '@cdo/apps/aichat/host/ChatHostContext';

import {ValidationAttempt} from '../../progress/model';

/** One piece of work a student did on a step, as text a judge can read. */
export interface StepWork {
  /** When it was done, in epoch milliseconds. */
  at: number;
  /** What to judge: the change the student made. */
  change: string;
  /** How it came about: the exchange, the runs, whatever the lab records. */
  process?: string;
  /** The whole project as it stands afterwards, for context. */
  project?: string;
}

/** What a host holds of the lab, for its adapter to work through. */
export interface LabHandles {
  chat?: ChatHandle;
}

/**
 * Subscribes `listener` to each piece of work the student does on the open
 * step from now on, and returns the unsubscribe.
 */
export type WorkObserver = (
  handles: LabHandles,
  listener: (work: StepWork) => void
) => () => void;

/**
 * Subscribes `listener` to the chat's transcript at each reply the tutor
 * finishes on the open step from now on, and returns the unsubscribe.
 */
export type ReplyObserver = (
  handles: LabHandles,
  listener: (transcript: ChatTranscript) => void
) => () => void;

/** How a lab takes part in checking its work. */
export interface WorkAdapter {
  /** How the lab reports work. */
  observeWork: WorkObserver;
  /** How the lab reports the student talking with its tutor, if it does. */
  observeReplies?: ReplyObserver;
  /**
   * How the lab tells the student a validation check has begun and waits for it, if it does.
   * Returns a callback to be invoked when the check is complete.
   */
  notifyChecking?: (handles: LabHandles) => () => void;
  /** How the lab tells the student a verdict, if it does. */
  reportAttempt?: (
    handles: LabHandles,
    attempt: Omit<ValidationAttempt, 'at'>
  ) => void;
  /** How the lab tells the student Continue opened on their chat, if it does. */
  reportUnlock?: (
    handles: LabHandles,
    check: Omit<ValidationAttempt, 'at'>
  ) => void;
}
