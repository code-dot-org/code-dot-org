import classNames from 'classnames';
import React, {useState, useCallback} from 'react';

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
  const [offsetParent, setOffsetParent] = useState<DOMRect>();

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
      setButtonRect((e.target as HTMLElement).getBoundingClientRect());
      setOffsetParent(
        (e.target as HTMLElement).offsetParent?.getBoundingClientRect()
      );
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
    [setIsOpen, setIsOpenFalse]
  );

  return (
    <>
      <Button
        className={classNames(className, darkModeStyles.iconOnlyTertiaryButton)}
        size="xs"
        icon={{iconStyle: 'solid', iconName}}
        color="white"
        isIconOnly
        onClick={clickHandler}
        type={'tertiary'}
        id={id}
      />
      {isOpen && buttonRect && offsetParent && (
        <div
          className={moduleStyles['popup-button-menu']}
          onClick={() => setIsOpen(false)}
          style={{
            top:
              buttonRect.top + buttonRect.height + 5 - (offsetParent.top || 0),
            [alignment]: buttonRect[alignment] - (offsetParent[alignment] || 0),
          }}
        >
          {children}
        </div>
      )}
    </>
  );
};
