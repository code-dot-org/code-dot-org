import {useEffect, RefObject} from 'react';

import useEscapeKeyHandler from '@/common/hooks/useEscapeKeyHandler';

const closeOnEvent = (
  ref: RefObject<HTMLElement>,
  onClose: () => void,
  isActive: boolean,
): void => {
  // Handle escape key press
  useEscapeKeyHandler(onClose);

  // Handle click and keyboard events
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent | FocusEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('focusin', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleClickOutside);
    };
  }, [ref, onClose, isActive]);
};

export default closeOnEvent;
