import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import {FocusTrap} from 'focus-trap-react';
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import {createPortal} from 'react-dom';

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './popUpButton.module.css';

// Ported from apps/src/codebridge/PopUpButton. An icon-button trigger whose menu
// renders in a portal on document.body — so, unlike an inline-positioned
// dropdown, it is never clipped or stacked under the surrounding editor / scroll
// containers. Position is computed from the trigger's rect (flip up if it would
// run off the bottom, clamp horizontally), and a focus trap + a "close other
// dropdowns" event give it the same keyboard and one-open-at-a-time behavior as
// the legacy version.

type PopUpButtonProps = {
  iconName: string;
  children?: ReactNode;
  className?: string;
  alignment?: 'left' | 'right';
  id?: string;
  disabled?: boolean;
  ariaLabel?: string;
  initialFocusId?: string;
};

const TOP_PADDING = 5;

// Custom event used to coordinate closing other dropdowns when one opens.
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
  // Start off-screen so the first open (before the position is computed) does
  // not render the menu at its in-flow static position — the bottom of <body> —
  // which momentarily extends the page and reflows the full-width lab. Later
  // opens already hold the previous computed position, so only the first flashed.
  const [dropdownStyles, setDropdownStyles] = useState<CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [updatedStyles, setUpdatedStyles] = useState(false);
  const [computedButtonStyles, setComputedButtonStyles] = useState(className);
  // Trigger element ref, to remove focus when closing the dropdown.
  const buttonElementRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  // Unique identifier for this dropdown instance.
  const instanceId = useRef(crypto.randomUUID());
  // Track pending timeouts for cleanup.
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // The portaled menu is rendered outside the lab container, so stamp the theme
  // on it directly.
  const {theme} = useTheme();

  const setIsOpenFalse = useCallback(() => {
    setIsOpen(false);
    document.removeEventListener('click', setIsOpenFalse);
    buttonElementRef.current?.blur();

    // This operates on a delay, so update the styles on a delay too.
    const timeoutId = setTimeout(() => {
      setComputedButtonStyles(className);
      timeoutsRef.current.delete(timeoutId);
    }, 0);
    timeoutsRef.current.add(timeoutId);
  }, [className]);

  // Close when another dropdown opens.
  useEffect(() => {
    const handleCloseOthers = (e: Event) => {
      const customEvent = e as CustomEvent<{sourceId: string}>;
      if (customEvent.detail.sourceId !== instanceId.current) {
        const timeoutId = setTimeout(() => {
          setIsOpenFalse();
          timeoutsRef.current.delete(timeoutId);
        }, 0);
        timeoutsRef.current.add(timeoutId);
      }
    };
    document.addEventListener(CLOSE_OTHER_DROPDOWNS_EVENT, handleCloseOthers);
    return () =>
      document.removeEventListener(
        CLOSE_OTHER_DROPDOWNS_EVENT,
        handleCloseOthers,
      );
  }, [setIsOpenFalse]);

  const clickHandler = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setUpdatedStyles(false);
      setButtonRef(e.currentTarget as HTMLElement);
      if (isOpen) {
        document.removeEventListener('click', setIsOpenFalse);
        setIsOpenFalse();
      } else {
        // Tell other dropdowns to close.
        document.dispatchEvent(
          new CustomEvent(CLOSE_OTHER_DROPDOWNS_EVENT, {
            detail: {sourceId: instanceId.current},
          }),
        );

        // Defer adding the outside-click handler to the next tick, otherwise it
        // fires immediately and re-closes the menu.
        const timeoutId = setTimeout(() => {
          document.addEventListener('click', setIsOpenFalse);
          timeoutsRef.current.delete(timeoutId);
        }, 0);
        timeoutsRef.current.add(timeoutId);
        setIsOpen(true);
      }
    },
    [isOpen, setIsOpenFalse],
  );

  // Position the menu from the trigger's rect once it is shown.
  useEffect(() => {
    const updateDropdownPositionIfShown = () => {
      if (isOpen && buttonRef && dropdownRef.current) {
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const buttonRect = buttonRef.getBoundingClientRect();
        // Flip above the trigger if the menu would run off the bottom.
        const wouldGoOffscreenBelow =
          buttonRect.bottom + TOP_PADDING + dropdownRect.height >
          window.innerHeight;
        const top = wouldGoOffscreenBelow
          ? buttonRect.top - dropdownRect.height - TOP_PADDING + window.scrollY
          : buttonRect.bottom + TOP_PADDING + window.scrollY;

        // Clamp horizontally within the viewport.
        let left =
          alignment === 'right'
            ? buttonRect.right - dropdownRect.width + window.scrollX
            : buttonRect.left + window.scrollX;
        left = Math.max(
          window.scrollX,
          Math.min(
            left,
            window.innerWidth - dropdownRect.width + window.scrollX,
          ),
        );

        const timeoutId = setTimeout(() => {
          setDropdownStyles({top, left});
          setUpdatedStyles(true);
          setComputedButtonStyles(classNames(className, styles.active));
          timeoutsRef.current.delete(timeoutId);
        }, 0);
        timeoutsRef.current.add(timeoutId);
      }
    };

    updateDropdownPositionIfShown();
    window.addEventListener('resize', updateDropdownPositionIfShown);
    return () =>
      window.removeEventListener('resize', updateDropdownPositionIfShown);
  }, [alignment, buttonRef, isOpen, className]);

  // Clear pending timeouts and listeners on unmount.
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
      timeouts.clear();
      document.removeEventListener('click', setIsOpenFalse);
    };
  }, [setIsOpenFalse]);

  // Keep the menu hidden until its position is computed, so it never flashes in
  // the wrong place.
  const dropdownStyleProps: CSSProperties = {
    visibility: updatedStyles ? 'visible' : 'hidden',
    ...dropdownStyles,
  };

  return (
    <>
      <MuiIconButton
        id={id}
        variant="text"
        color="tertiary"
        size="extraSmall"
        disabled={disabled}
        className={computedButtonStyles}
        onClick={clickHandler}
        aria-label={ariaLabel}
        type="button"
        ref={buttonElementRef}
        aria-expanded={isOpen}
      >
        <FontAwesomeV6Icon iconStyle="solid" iconName={iconName} />
      </MuiIconButton>
      {isOpen &&
        createPortal(
          <FocusTrap
            focusTrapOptions={{
              isKeyForward: (event: KeyboardEvent) => {
                if (event.key === 'ArrowDown') {
                  event.stopPropagation();
                  return true;
                }
                return event.key === 'Tab';
              },
              isKeyBackward: (event: KeyboardEvent) => {
                if (event.key === 'ArrowUp') {
                  event.stopPropagation();
                  return true;
                }
                return event.key === 'Tab' && event.shiftKey;
              },
              clickOutsideDeactivates: true,
              preventScroll: true,
              fallbackFocus: initialFocusId
                ? `#${initialFocusId}`
                : '#popup-button-fallback',
            }}
          >
            <div
              id="popup-button-fallback"
              tabIndex={-1}
              className={styles.menu}
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
          document.body,
        )}
    </>
  );
};
