import {useEffect, useRef} from 'react';

import {workAdapterFor} from '../../ai/validation/adapters';
import {chatThresholds} from '../../ai/validation/chatThresholds';
import {LabHandles} from '../../ai/validation/types';
import {UNLOCK_MESSAGES} from '../../ai/validation/unlockMessages';
import {sendContinueUnlocked} from '../../metricsHelpers';
import {
  StepProgress,
  ValidationAttempt,
  chatChecks,
  workAttempts,
} from '../../progress/model';
import {Checkpoint, LevelStep} from '../../types';

export interface ChatUnlockOptions extends LabHandles {
  checkpoint: Checkpoint;
  step: LevelStep;
  /** The step's progress as it stands. */
  progress: StepProgress | undefined;
  /** Whether Continue is already open, by work or by chat. */
  continueAllowed: boolean;
  /** Appends a chat check to the step's validation history. */
  recordAttempt: (attempt: Omit<ValidationAttempt, 'at'>) => void;
}

/**
 * Opens Continue on a checked step from the chat alone, so a student who is
 * trying but cannot get a build to pass is not stuck. The lab reports the
 * chat at each reply the tutor finishes, and at the reply limit Continue
 * opens regardless. The decision is recorded on the step and told in the
 * chat. Does nothing once Continue is open, on a step with no validation
 * block, or in a lab that does not report its chat.
 */
export function useChatUnlock(options: ChatUnlockOptions): void {
  // Read at reply time, so a change to the options does not resubscribe.
  const latestOptions = useRef(options);
  latestOptions.current = options;
  const {chat, step, continueAllowed} = options;
  const adapter =
    step.validation && !continueAllowed
      ? workAdapterFor(step.levelProperties?.appName ?? '')
      : undefined;
  const observe = adapter?.observeReplies;

  useEffect(() => {
    if (!adapter || !observe) return;
    return observe({chat}, transcript => {
      const currentOptions = latestOptions.current;
      if (currentOptions.continueAllowed) return;
      const {replyLimit} = chatThresholds();
      if (transcript.replies < replyLimit) return;
      // Recorded already, say when the save has not come back yet: not again.
      const hasPassedLimit = chatChecks(currentOptions.progress).some(
        check => check.source === 'limit'
      );
      if (hasPassedLimit) return;

      const check: Omit<ValidationAttempt, 'at'> = {
        source: 'limit',
        pass: true,
        evidenceLevel: 0,
        reason: UNLOCK_MESSAGES.limit,
        replies: transcript.replies,
      };
      currentOptions.recordAttempt(check);
      sendContinueUnlocked(
        'replyLimit',
        currentOptions.checkpoint,
        currentOptions.step,
        {
          validationAttempts: workAttempts(currentOptions.progress).length,
          replies: transcript.replies,
        }
      );
      adapter.reportUnlock?.({chat: currentOptions.chat}, check);
    });
  }, [adapter, observe, chat]);
}
