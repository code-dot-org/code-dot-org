import classNames from 'classnames';
import React, {useState, useCallback, useRef, useEffect} from 'react';
import {createPortal} from 'react-dom';

import Button from '@cdo/apps/componentLibrary/button';

import moduleStyles from './PopUpButton.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

type PopUpButtonProps = {
  iconName: string;
  children?: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'right';
  id?: string;
};

export const PopUpButton = ({
  children,
  iconName,
  className,
  alignment = 'left',
  id,
}: PopUpButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect>();
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [updatedStyles, setUpdatedStyles] = useState(false);

  const setIsOpenFalse = useCallback(() => {
    setIsOpen(false);
    document.removeEventListener('click', setIsOpenFalse);
  }, [setIsOpen]);

  const clickHandler = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLAnchorElement>
    ) => {
      e.stopPropagation();
      setUpdatedStyles(false);
      setButtonRect((e.target as HTMLElement).getBoundingClientRect());
      setIsOpen(oldIsOpen => {
        const newIsOpen = !oldIsOpen;
        if (newIsOpen) {
          // React 17 changed the location where clickhandlers are added, so we want to defer adding the close
          // handler until the next tick of the event loop, otherwise it'll fire immediately and re-close the pop up.'
          setTimeout(
            () => document.addEventListener('click', setIsOpenFalse),
            0
          );
        } else {
          document.removeEventListener('click', setIsOpenFalse);
        }
        return newIsOpen;
      });
    },
    [setIsOpenFalse]
  );

  // Effect to update tooltip styles when the tooltip is shown
  useEffect(() => {
    const updateDropdownPositionIfShown = () => {
      if (isOpen) {
        if (buttonRect && dropdownRef.current) {
          const dropdownRect = dropdownRef.current.getBoundingClientRect();
          const top = buttonRect.top + buttonRect.height + 5;
          const left =
            alignment === 'right'
              ? buttonRect.right - dropdownRect.width
              : buttonRect.left;
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
  }, [alignment, buttonRect, isOpen]);

  // We wait to make the dropdown visible until we've calculated the position
  // it should be in based on its own width and the size of the button.
  // We do this to avoid the dropdown appearing in the wrong place momentarily.
  const dropdownStyleProps: React.CSSProperties = {
    visibility: updatedStyles ? 'visible' : 'hidden',
    ...dropdownStyles,
  };

  return (
    <>
      <Button
        className={classNames(className, darkModeStyles.tertiaryButton)}
        size="xs"
        icon={{iconStyle: 'solid', iconName}}
        color="white"
        isIconOnly
        onClick={clickHandler}
        type={'tertiary'}
        id={id}
      />
      {isOpen &&
        createPortal(
          <div
            className={moduleStyles['popup-button-menu']}
            onClick={() => setIsOpen(false)}
            style={dropdownStyleProps}
            ref={dropdownRef}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
};
