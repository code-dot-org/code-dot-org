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
  disabled?: boolean;
};

const TOP_PADDING = 5;

export const PopUpButton = ({
  children,
  iconName,
  className,
  alignment = 'left',
  id,
  disabled,
}: PopUpButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
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
      setButtonRef(e.target as HTMLElement);
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

  // Effect to update dropdown position when it is shown.
  useEffect(() => {
    const updateDropdownPositionIfShown = () => {
      if (isOpen) {
        if (buttonRef && dropdownRef.current) {
          const dropdownRect = dropdownRef.current.getBoundingClientRect();
          const buttonRect = buttonRef.getBoundingClientRect();
          const top =
            buttonRect.top + buttonRect.height + TOP_PADDING + window.scrollY;
          const left =
            alignment === 'right'
              ? buttonRect.right - dropdownRect.width + window.scrollX
              : buttonRect.left + window.scrollX;
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
  }, [alignment, buttonRef, isOpen]);

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
        disabled={disabled}
      />
      {isOpen &&
        // We use a portal so the dropdown can appear above all other elements.
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
