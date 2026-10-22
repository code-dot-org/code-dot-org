import {useEffect, useRef} from 'react';

import {workAdapterFor} from '../../ai/validation/adapters';
import {LabHandles} from '../../ai/validation/types';
import {
  ValidateStepOptions,
  validateStep,
} from '../../ai/validation/validateStep';
import {ValidationAttempt} from '../../progress/model';

export interface StepValidationOptions
  extends Omit<ValidateStepOptions, 'work'>,
    LabHandles {
  recordValidation: (attempt: Omit<ValidationAttempt, 'at'>) => void;
}

/**
 * Judges each piece of work the student does on the open step, as the
 * step's lab reports it, records the verdict, and has the lab tell the
 * student. Does nothing on a step with no validation block, or in a lab
 * that takes no part in checking.
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
    return adapter.observe({chat}, work => {
      const current = latest.current;
      validateStep({...current, work}).then(attempt => {
        if (!attempt) return;
        current.recordValidation(attempt);
        adapter.report?.({chat: current.chat}, attempt);
      });
    });
  }, [adapter, chat]);
}
