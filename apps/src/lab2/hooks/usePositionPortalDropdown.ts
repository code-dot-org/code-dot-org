import React, {useEffect} from 'react';

const TOP_PADDING = 5;

export const usePositionPortalDropdown = (
  menuRef: HTMLElement | null,
  parentRef: HTMLElement | null,
  setStyles: (styles: React.CSSProperties) => void,
  setUpdatedStyles: (hasUpdated: boolean) => void,
  isOpen: boolean,
  alignment: 'right' | 'left'
) => {
  // Effect to update dropdown position when it is shown.
  useEffect(() => {
    const updateDropdownPositionIfShown = () => {
      if (isOpen) {
        if (parentRef && menuRef) {
          const dropdownRect = menuRef.getBoundingClientRect();
          const parentRect = parentRef.getBoundingClientRect();
          const top =
            parentRect.top + parentRect.height + TOP_PADDING + window.scrollY;
          const left =
            alignment === 'right'
              ? parentRect.right - dropdownRect.width + window.scrollX
              : parentRect.left + window.scrollX;
          setStyles({
            top,
            left,
          });
          setUpdatedStyles(true);
        }
      }
    };

    updateDropdownPositionIfShown();

    window.addEventListener('resize', updateDropdownPositionIfShown);
    return () => {
      window.removeEventListener('resize', updateDropdownPositionIfShown);
    };
  }, [alignment, isOpen, menuRef, parentRef, setStyles, setUpdatedStyles]);
};
