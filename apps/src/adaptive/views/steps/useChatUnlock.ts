import {useEffect, useRef} from 'react';

import {AichatContext} from '@cdo/apps/aichat/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {workAdapterFor} from '../../ai/validation/adapters';
import {chatThresholds} from '../../ai/validation/chatThresholds';
import {judgeEffort} from '../../ai/validation/judgeEffort';
import {LabHandles} from '../../ai/validation/types';
import {UNLOCK_MESSAGES} from '../../ai/validation/unlockMessages';
import {
  sendAdaptiveEvent,
  sendContinueUnlocked,
  stepProperties,
} from '../../metricsHelpers';
import {
  SkipReason,
  StepProgress,
  ValidationAttempt,
  skippedAttempts,
  workAttempts,
} from '../../progress/model';
import {Checkpoint, LevelStep, Pathway} from '../../types';

export interface ChatUnlockOptions extends LabHandles {
  pathway: Pathway;
  checkpoint: Checkpoint;
  step: LevelStep;
  /** The instructions the student saw, generated or authored. */
  instructions: string | undefined;
  aichatContext: AichatContext;
  /** The step's progress as it stands. */
  progress: StepProgress | undefined;
  /** Whether Continue is already open, by work or by chat. */
  continueAllowed: boolean;
  /** Appends a chat entry to the step's validation history. */
  recordAttempt: (attempt: Omit<ValidationAttempt, 'at'>) => void;
}

/**
 * Opens Continue for the step from its chat, when the lab reports one.
 * Applies only to a step with a validation block while Continue is still
 * locked. From one reply count on, a judge reads the chat after each reply
 * and opens Continue once the student's effort is real; when they reach the
 * reply limit, Continue opens regardless. The opening is recorded on the
 * step and told in the chat; a judge that says no records nothing.
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
    let judging = false;
    return observe({chat}, transcript => {
      const currentOptions = latestOptions.current;
      if (currentOptions.continueAllowed) return;
      const {effortCheckAt, replyLimit} = chatThresholds();
      const validationAttempts = workAttempts(currentOptions.progress).length;
      const unlock = (skipReason: SkipReason, traceId?: string) => {
        const check: Omit<ValidationAttempt, 'at'> = {
          pass: true,
          evidenceLevel: 0,
          reason: UNLOCK_MESSAGES[skipReason],
          skipReason,
          replies: transcript.replies,
          traceId,
        };
        currentOptions.recordAttempt(check);
        sendContinueUnlocked(
          skipReason,
          currentOptions.checkpoint,
          currentOptions.step,
          {validationAttempts, replies: transcript.replies}
        );
        adapter.reportUnlock?.({chat: currentOptions.chat}, check);
      };

      // Recorded already, say when the save has not come back yet: not again.
      const hasPassedLimit = skippedAttempts(currentOptions.progress).some(
        check => check.skipReason === 'limitReached'
      );
      if (transcript.replies >= replyLimit) {
        if (!hasPassedLimit) unlock('limitReached');
        return;
      }
      // One judgement at a time; a no is not recorded, and the next reply gets another.
      if (transcript.replies < effortCheckAt || judging) return;
      judging = true;
      const judgingAt = Date.now();
      judgeEffort({
        pathway: currentOptions.pathway,
        checkpoint: currentOptions.checkpoint,
        step: currentOptions.step,
        instructions: currentOptions.instructions,
        transcript: transcript.text,
        replies: transcript.replies,
        aichatContext: currentOptions.aichatContext,
      }).then(judgement => {
        judging = false;
        if (!judgement) return;
        sendAdaptiveEvent(
          judgement.pass
            ? EVENTS.ADAPTIVE_EFFORT_CHECK_PASSED
            : EVENTS.ADAPTIVE_EFFORT_CHECK_FAILED,
          {
            ...stepProperties(currentOptions.checkpoint, currentOptions.step),
            replies: transcript.replies,
            validationAttempts,
            latencyMs: Date.now() - judgingAt,
          }
        );
        if (judgement.pass) unlock('effortDemonstrated', judgement.traceId);
      });
    });
  }, [adapter, observe, chat]);
}
