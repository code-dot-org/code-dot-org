// hooks/useDropdownPosition.ts
import {useLayoutEffect, useState} from 'react';

const TOP_PADDING = 5;

// A hook to find the styles for the dropdown container.
export default function useDropdownPosition(
  buttonRef: React.RefObject<HTMLElement>,
  menuRef: React.RefObject<HTMLElement>
) {
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    const updateDropdownPosition = () => {
      if (buttonRef.current && menuRef.current) {
        const dropdownRect = menuRef.current.getBoundingClientRect();
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
  }, [buttonRef, menuRef]);

  return dropdownStyles;
}
