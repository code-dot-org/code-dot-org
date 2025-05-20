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
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [updatedStyles, setUpdatedStyles] = useState(false);
  const [computedButtonStyles, setComputedButtonStyles] = useState(className);
  // We need to set the theme here becausse the dropdown is rendered in a portal, outside of the
  // main lab container.
  const {theme} = useTheme();

  const setIsOpenFalse = useCallback(() => {
    setIsOpen(false);
    document.removeEventListener('click', setIsOpenFalse);
    // Because this operates on a delay, we also have to update the styles on a delay
    setTimeout(() => {
      setComputedButtonStyles(className);
    }, 300);
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
        color={'black'}
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
