import {useEffect} from 'react';

/**
 * useDocumentKeydown
 * A custom hook that attaches a `keydown` event listener to the document
 * and calls the provided callback function when a key is pressed.
 *
 * @param callback - The function to call when a key is pressed.
 */
const useDocumentKeydown = (callback?: (event: KeyboardEvent) => void) => {
  useEffect(() => {
    if (callback) {
      document.addEventListener('keydown', callback);
    }

    return () => {
      if (callback) {
        document.removeEventListener('keydown', callback);
      }
    };
  }, [callback]);
};

export default useDocumentKeydown;
