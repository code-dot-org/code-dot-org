// hooks/useDropdownPosition.ts
import {useLayoutEffect, useState} from 'react';

const TOP_PADDING = 5;

// A hook that calculates and updates the dropdown's position relative to the
// trigger button - returns the inline styles to position the dropdown below and
// to the right of the button.
export default function useDropdownPosition(
  buttonRef: React.RefObject<HTMLElement>,
  dropdownRef: React.RefObject<HTMLElement>
) {
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    const updateDropdownPosition = () => {
      if (buttonRef.current && dropdownRef.current) {
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const parentRect = buttonRef.current.getBoundingClientRect();
        const top =
          parentRect.top + parentRect.height + TOP_PADDING + window.scrollY;
        const left = parentRect.right - dropdownRect.width + window.scrollX;
        setDropdownStyles({top, left});
      }
    };

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [buttonRef, dropdownRef]);

  return dropdownStyles;
}
