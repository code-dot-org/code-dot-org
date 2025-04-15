import {useEffect, RefObject} from 'react';

const closeOnEvent = (
  ref: RefObject<HTMLElement>,
  onClose: () => void,
  isActive: boolean,
): void => {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent | FocusEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('focusin', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, onClose, isActive]);
};

export default closeOnEvent;
