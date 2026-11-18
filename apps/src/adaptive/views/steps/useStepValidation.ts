import {useEffect, useRef} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {workAdapterFor} from '../../ai/validation/adapters';
import {LabHandles} from '../../ai/validation/types';
import {
  ValidateStepOptions,
  validateStep,
} from '../../ai/validation/validateStep';
import {
  sendAdaptiveEvent,
  sendContinueUnlocked,
  stepProperties,
} from '../../metricsHelpers';
import {
  FAILED_VALIDATIONS_TO_CONTINUE,
  StepProgress,
  ValidationAttempt,
  workAttempts,
} from '../../progress/model';

import {useChatUnlock} from './useChatUnlock';

export interface StepValidationOptions
  extends Omit<ValidateStepOptions, 'work'>,
    LabHandles {
  /** Appends a check, of work or of the chat, to the step's validation history. */
  recordValidation: (attempt: Omit<ValidationAttempt, 'at'>) => void;
  /** The step's progress as it stands. */
  progress: StepProgress | undefined;
  /** Whether Continue is already open, by work or by chat. */
  continueAllowed: boolean;
}

/**
 * Judges each piece of work the student does on the open step, as the
 * step's lab reports it, records the verdict, and has the lab tell the
 * student, first that a check is running and then its verdict. Does
 * nothing on a step with no validation block, or in a lab that takes no
 * part in checking. Watches the chat too, through useChatUnlock, for the
 * student who cannot get a build to pass.
 */
export function useStepValidation(options: StepValidationOptions): void {
  // Read at judge time, so a change to the options does not resubscribe.
  const latestOptions = useRef(options);
  latestOptions.current = options;
  const {chat, step} = options;
  const adapter = step.validation
    ? workAdapterFor(step.levelProperties?.appName ?? '')
    : undefined;

  useChatUnlock({
    checkpoint: options.checkpoint,
    step,
    chat,
    progress: options.progress,
    continueAllowed: options.continueAllowed,
    recordAttempt: options.recordValidation,
  });

  useEffect(() => {
    if (!adapter) return;
    return adapter.observeWork({chat}, work => {
      const currentOptions = latestOptions.current;
      let dismissChecking: (() => void) | undefined;
      let judgingAt = 0;
      validateStep({
        ...currentOptions,
        work,
        onJudging: () => {
          judgingAt = Date.now();
          dismissChecking = adapter.notifyChecking?.({
            chat: currentOptions.chat,
          });
        },
      }).then(attempt => {
        dismissChecking?.();
        if (!attempt) return;
        const attemptNumber = workAttempts(currentOptions.progress).length + 1;
        sendAdaptiveEvent(
          attempt.pass
            ? EVENTS.ADAPTIVE_WORK_VALIDATION_PASSED
            : EVENTS.ADAPTIVE_WORK_VALIDATION_FAILED,
          {
            ...stepProperties(currentOptions.checkpoint, currentOptions.step),
            skillId: currentOptions.step.validation?.measures.skillId,
            evidenceLevel: attempt.evidenceLevel,
            attemptNumber,
            latencyMs: Date.now() - judgingAt,
          }
        );
        // Continue opens on this attempt: told once, the way the chat checks are.
        if (!currentOptions.continueAllowed) {
          const reason = attempt.pass
            ? 'validationPassed'
            : attemptNumber >= FAILED_VALIDATIONS_TO_CONTINUE
            ? 'failedValidations'
            : undefined;
          if (reason) {
            sendContinueUnlocked(
              reason,
              currentOptions.checkpoint,
              currentOptions.step,
              {
                validationAttempts: attemptNumber,
              }
            );
          }
        }
        currentOptions.recordValidation(attempt);
        adapter.reportAttempt?.({chat: currentOptions.chat}, attempt);
      });
    });
  }, [adapter, chat]);
}
