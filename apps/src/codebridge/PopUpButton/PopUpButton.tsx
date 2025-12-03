import Button from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import React, {useState, useCallback, useRef, useEffect} from 'react';
import {createPortal} from 'react-dom';

import moduleStyles from './pop-up-button.module.scss';

type PopUpButtonProps = {
  iconName: string;
  children?: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'right';
  id?: string;
  disabled?: boolean;
  ariaLabel?: string;
  initialFocusId?: string;
};

const TOP_PADDING = 5;

// Track which dropdown is currently open
let currentOpenDropdown: (() => void) | null = null;

export const PopUpButton = ({
  children,
  iconName,
  className,
  alignment = 'left',
  id,
  disabled,
  ariaLabel,
  initialFocusId,
}: PopUpButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
  const [updatedStyles, setUpdatedStyles] = useState(false);
  const [computedButtonStyles, setComputedButtonStyles] = useState(className);
  // Get the button element ref to remove focus when closing the dropdown
  const buttonElementRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // We need to set the theme here because the dropdown is
  // rendered in a portal, outside of the main lab container.
  const {theme} = useTheme();

  const setIsOpenFalse = useCallback(() => {
    setIsOpen(false);
    document.removeEventListener('click', setIsOpenFalse);

    // Clear the currentOpenDropdown variable when closing
    if (currentOpenDropdown === setIsOpenFalse) {
      currentOpenDropdown = null;
    }

    // Remove focus from the button when closing the dropdown
    buttonElementRef.current?.blur();

    // Because this operates on a delay, update the styles on a delay too
    setTimeout(() => {
      setComputedButtonStyles(className);
    }, 0);
  }, [setIsOpen, className]);

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
          // Close any other open dropdowns before opening this one
          // Use setTimeout to avoid updating another component during render
          if (currentOpenDropdown && currentOpenDropdown !== setIsOpenFalse) {
            const closeOtherDropdown = currentOpenDropdown;
            setTimeout(() => closeOtherDropdown(), 0);
          }

          // Track this dropdown as the currently open one
          currentOpenDropdown = setIsOpenFalse;

          // Defer adding the close handler until the next tick of the event
          // loop, otherwise it'll fire immediately and re-close the pop up.
          setTimeout(
            () => document.addEventListener('click', setIsOpenFalse),
            0
          );
        } else {
          document.removeEventListener('click', setIsOpenFalse);
          // Clear the currentOpenDropdown variable when closing
          if (currentOpenDropdown === setIsOpenFalse) {
            currentOpenDropdown = null;
          }
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
          setComputedButtonStyles(classNames(className, moduleStyles.active));
        }
      }
    };

    updateDropdownPositionIfShown();

    window.addEventListener('resize', updateDropdownPositionIfShown);
    return () => {
      window.removeEventListener('resize', updateDropdownPositionIfShown);
    };
  }, [alignment, buttonRef, isOpen, className]);

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
        ref={buttonElementRef}
        className={computedButtonStyles}
        size="xs"
        icon={{iconStyle: 'solid', iconName}}
        isIconOnly
        onClick={clickHandler}
        type={'tertiary'}
        id={id}
        disabled={disabled}
        ariaLabel={ariaLabel}
        aria-expanded={isOpen}
        color={'gray'}
      />
      {isOpen &&
        // We use a portal so the dropdown can appear above all other elements.
        // The children take a moment to render in the portal, so we need a
        // fallbackFocus to bridge the load time gap and prevent a load error.
        createPortal(
          <FocusTrap
            focusTrapOptions={{
              isKeyForward: event => {
                if (event.key === 'ArrowDown') {
                  event.stopPropagation();
                  return true;
                }
                // If we remove this line, tab will move focus but focus will
                // not be trapped. Same with shift+tab below.
                return event.key === 'Tab';
              },
              isKeyBackward: event => {
                if (event.key === 'ArrowUp') {
                  event.stopPropagation();
                  return true;
                }
                return event.key === 'Tab' && event.shiftKey;
              },
              clickOutsideDeactivates: true,
              fallbackFocus: initialFocusId
                ? `#${initialFocusId}`
                : '#fallback-element',
            }}
          >
            <div
              id="fallback-element"
              tabIndex={-1}
              className={moduleStyles['popup-button-menu']}
              onClick={() => setIsOpen(false)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setIsOpen(false);
                }
              }}
              style={dropdownStyleProps}
              ref={dropdownRef}
              role="menu"
              data-theme={theme}
            >
              {children}
            </div>
          </FocusTrap>,
          document.body
        )}
    </>
  );
};
