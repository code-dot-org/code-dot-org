import {useEffect, useRef} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {workAdapterFor} from '../../ai/validation/adapters';
import {LabHandles} from '../../ai/validation/types';
import {
  ValidateStepOptions,
  validateStep,
} from '../../ai/validation/validateStep';
import {sendAdaptiveEvent, stepProperties} from '../../metricsHelpers';
import {ValidationAttempt} from '../../progress/model';

export interface StepValidationOptions
  extends Omit<ValidateStepOptions, 'work'>,
    LabHandles {
  recordValidation: (attempt: Omit<ValidationAttempt, 'at'>) => void;
  /** Checks already recorded on the step. */
  priorAttempts?: number;
}

/**
 * Judges each piece of work the student does on the open step, as the
 * step's lab reports it, records the verdict, and has the lab tell the
 * student, first that a check is running and then its verdict. Does
 * nothing on a step with no validation block, or in a lab that takes no
 * part in checking.
 */
export function useStepValidation(options: StepValidationOptions): void {
  // Read at judge time, so a change to the options does not resubscribe.
  const latest = useRef(options);
  latest.current = options;
  const {chat, step} = options;
  const adapter = step.validation
    ? workAdapterFor(step.levelProperties?.appName ?? '')
    : undefined;

  useEffect(() => {
    if (!adapter) return;
    return adapter.observeWork({chat}, work => {
      const current = latest.current;
      let dismissChecking: (() => void) | undefined;
      let judgingAt = 0;
      validateStep({
        ...current,
        work,
        onJudging: () => {
          judgingAt = Date.now();
          dismissChecking = adapter.notifyChecking?.({chat: current.chat});
        },
      }).then(attempt => {
        dismissChecking?.();
        if (!attempt) return;
        sendAdaptiveEvent(
          attempt.pass
            ? EVENTS.ADAPTIVE_WORK_VALIDATION_PASSED
            : EVENTS.ADAPTIVE_WORK_VALIDATION_FAILED,
          {
            ...stepProperties(current.checkpoint, current.step),
            skillId: current.step.validation?.measures.skillId,
            evidenceLevel: attempt.evidenceLevel,
            attemptNumber: (current.priorAttempts ?? 0) + 1,
            latencyMs: Date.now() - judgingAt,
          }
        );
        current.recordValidation(attempt);
        adapter.reportAttempt?.({chat: current.chat}, attempt);
      });
    });
  }, [adapter, chat]);
}
