import {useCallback, useState, type FormEvent} from 'react';

import {modalErrors, type ModalErrors} from './modalErrors';

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};

/**
 * Shared modal-form plumbing: holds field/form error state and wraps a modal's
 * submit action with the common clear-errors → run → catch-into-errors flow, so
 * each modal declares only its fields and what to do on submit.
 */
export function useModalForm() {
  const [errors, setErrors] = useState<ModalErrors>(NO_ERRORS);
  const resetErrors = useCallback(() => setErrors(NO_ERRORS), []);

  const onSubmit =
    (action: () => Promise<void>) => async (event: FormEvent) => {
      event.preventDefault();
      setErrors(NO_ERRORS);
      try {
        await action();
      } catch (error) {
        setErrors(modalErrors(error));
      }
    };

  return {errors, setErrors, resetErrors, onSubmit};
}
