import {useCallback, useState, type FormEvent} from 'react';

import {modalErrors, type ModalErrors} from './modalErrors';

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};

/**
 * Holds a modal's error state and wraps its submit, so each modal declares only
 * its fields and what to do on submit.
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
