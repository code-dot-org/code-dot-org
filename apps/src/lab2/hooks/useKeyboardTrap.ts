import {useEffect} from 'react';

/* useful to trap keypresses on the document. Give it a string + a callback function, and whenever that key is typed,
   the callback is called.

   Most useful with helper Enter / Escape hooks for dialogs.

   Note that your callback will -not- receive the keyboard event.
*/

type keyboardTrapCallback = () => void;

export const useKeyboardTrap = (
  key: string,
  callback: keyboardTrapCallback
) => {
  useEffect(() => {
    const callbackRelay = (e: KeyboardEvent) => {
      if (e.key === key) {
        callback();
      }
    };

    document.addEventListener('keydown', callbackRelay);

    return () => document.removeEventListener('keydown', callbackRelay);
  }, [key, callback]);
};

export const useEscapeKeyboardTrap = (callback: keyboardTrapCallback) =>
  useKeyboardTrap('Escape', callback);

export const useEnterKeyboardTrap = (callback: keyboardTrapCallback) =>
  useKeyboardTrap('Enter', callback);
