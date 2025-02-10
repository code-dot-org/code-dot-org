import {useDocumentKeydown} from '@code-dot-org/component-library/common/hooks';
import {useCallback} from 'react';

/**
 * useEscapeKeyHandler
 * A custom hook to handle closing a component when the Escape key is pressed.
 *
 * @param callback - The optional function to call when the Escape key is pressed.
 */
const useEscapeKeyHandler = (callback?: () => void) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && callback) {
        callback();
      }
    },
    [callback]
  );

  useDocumentKeydown(callback && handleKeyDown);
};

export default useEscapeKeyHandler;
