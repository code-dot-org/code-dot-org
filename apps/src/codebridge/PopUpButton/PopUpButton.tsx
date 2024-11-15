import classNames from 'classnames';
import React, {useState, useCallback, useRef, useEffect} from 'react';
import {createPortal} from 'react-dom';

import Button from '@cdo/apps/componentLibrary/button';
import {updatePositionedElementStyles} from '@cdo/apps/componentLibrary/common/helpers';

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
  const [offsetParent, setOffsetParent] = useState<DOMRect>();
  const [dropdownPosition, setDropdownPosition] = useState<HTMLElement | null>(
    null
  );
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const setIsOpenFalse = useCallback(() => {
    setIsOpen(false);
    document.removeEventListener('click', setIsOpenFalse);
  }, [setIsOpen]);

  const updateDropdownStyles = useCallback(
    (dropdownPosition: HTMLElement | null) =>
      updatePositionedElementStyles({
        nodePosition: dropdownPosition,
        positionedElementRef: dropdownRef,
        direction: 'onBottom',
        setPositionedElementStyles: setDropdownStyles,
        tailOffset: 0,
        tailLength: 0,
        isPositionFixed: true,
      }),
    []
  );

  const clickHandler = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLAnchorElement>
    ) => {
      e.stopPropagation();
      setButtonRect((e.target as HTMLElement).getBoundingClientRect());
      setOffsetParent(
        (e.target as HTMLElement).offsetParent?.getBoundingClientRect()
      );
      setIsOpen(oldIsOpen => {
        const newIsOpen = !oldIsOpen;
        const newDropdownPosition = newIsOpen
          ? (e.target as HTMLElement)
          : null;
        setDropdownPosition(newDropdownPosition);
        if (newIsOpen) {
          updateDropdownStyles(newDropdownPosition);
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
    [setIsOpenFalse, updateDropdownStyles]
  );

  // Effect to update tooltip styles when the tooltip is shown
  useEffect(() => {
    const updateDropdownPositionIfShown = () => {
      if (isOpen) {
        updateDropdownStyles(dropdownPosition);
      }
    };

    updateDropdownPositionIfShown();

    window.addEventListener('resize', updateDropdownPositionIfShown);
    return () => {
      window.removeEventListener('resize', updateDropdownPositionIfShown);
    };
  }, [isOpen, updateDropdownStyles, dropdownPosition]);

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
        buttonRect &&
        offsetParent &&
        createPortal(
          <div
            className={moduleStyles['popup-button-menu']}
            onClick={() => setIsOpen(false)}
            style={dropdownStyles}
            ref={dropdownRef}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
};
