import Button from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import React, {useState, useCallback, useRef, useEffect} from 'react';
import {createPortal} from 'react-dom';

import {createUuid} from '@cdo/apps/utils';

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

// Custom event used to coordinate closing other dropdowns when one opens
const CLOSE_OTHER_DROPDOWNS_EVENT = 'popupbutton:close';

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
  // Unique identifier for current dropdown instance
  const instanceId = useRef(createUuid());
  // Track pending timeouts for cleanup
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // We need to set the theme here because the dropdown is
  // rendered in a portal, outside of the main lab container.
  const {theme} = useTheme();

  // Listen for close events from other dropdowns
  useEffect(() => {
    const handleCloseOthers = (e: Event) => {
      const customEvent = e as CustomEvent<{sourceId: string}>;
      if (customEvent.detail.sourceId !== instanceId.current) {
        // Defer state update to avoid updating during render
        const timeoutId = setTimeout(() => {
          setIsOpen(false);
          timeoutsRef.current.delete(timeoutId);
        }, 0);
        timeoutsRef.current.add(timeoutId);
      }
    };
    document.addEventListener(CLOSE_OTHER_DROPDOWNS_EVENT, handleCloseOthers);
    return () =>
      document.removeEventListener(
        CLOSE_OTHER_DROPDOWNS_EVENT,
        handleCloseOthers
      );
  }, []);

  // Handler to close the dropdown.
  const setIsOpenFalse = useCallback(() => {
    setIsOpen(false);
    document.removeEventListener('click', setIsOpenFalse);

    // Remove focus from the menu button when closing the dropdown
    buttonElementRef.current?.blur();

    // Because this operates on a delay, update the styles on a delay too
    const timeoutId = setTimeout(() => {
      setComputedButtonStyles(className);
      timeoutsRef.current.delete(timeoutId);
    }, 0);
    timeoutsRef.current.add(timeoutId);
  }, [setIsOpen, className]);

  // Handler to show the dropdown.
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
          // Tell other dropdowns to close
          document.dispatchEvent(
            new CustomEvent(CLOSE_OTHER_DROPDOWNS_EVENT, {
              detail: {sourceId: instanceId.current},
            })
          );

          // Defer adding the close handler until the next tick of the event
          // loop, otherwise it'll fire immediately and re-close the pop up.
          const timeoutId = setTimeout(() => {
            document.addEventListener('click', setIsOpenFalse);
            timeoutsRef.current.delete(timeoutId);
          }, 0);
          timeoutsRef.current.add(timeoutId);
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
          // Defer all state updates to avoid updating during render
          const timeoutId = setTimeout(() => {
            setDropdownStyles({
              top,
              left,
            });
            setUpdatedStyles(true);
            setComputedButtonStyles(classNames(className, moduleStyles.active));
            timeoutsRef.current.delete(timeoutId);
          }, 0);
          timeoutsRef.current.add(timeoutId);
        }
      }
    };

    updateDropdownPositionIfShown();

    window.addEventListener('resize', updateDropdownPositionIfShown);
    return () => {
      window.removeEventListener('resize', updateDropdownPositionIfShown);
    };
  }, [alignment, buttonRef, isOpen, className]);

  // Clear all pending timeouts and event listeners on unmount
  // to prevent memory leaks and state updates after unmount.
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      // Clear all pending timeouts to prevent state updates after unmount
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
      timeouts.clear();

      // Remove click event listener if it exists
      document.removeEventListener('click', setIsOpenFalse);
    };
  }, [setIsOpenFalse]);

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
