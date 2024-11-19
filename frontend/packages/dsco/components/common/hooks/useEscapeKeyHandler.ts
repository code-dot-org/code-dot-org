import {useCallback} from 'react';

import useDocumentKeydown from '@/common/hooks/useDocumentKeydown';

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
