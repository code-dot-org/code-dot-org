import React, {useEffect, useState} from 'react';

const TOP_PADDING = 5;

export const usePositionPortalDropdown = (
  menuRef: HTMLElement | null,
  parentRef: HTMLElement | null,
  isOpen: boolean,
  alignment: 'right' | 'left',
  label?: string
) => {
  const [updatedStyles, setUpdatedStyles] = useState(false);
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
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
          setDropdownStyles({
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
  }, [alignment, isOpen, label, menuRef, parentRef]);

  // We wait to make the dropdown visible until we've calculated the position
  // it should be in based on its own width and the size of the button.
  // We do this to avoid the dropdown appearing in the wrong place momentarily.
  const styles: React.CSSProperties = {
    visibility: updatedStyles && isOpen ? 'visible' : 'hidden',
    ...dropdownStyles,
  };

  return styles;
};
