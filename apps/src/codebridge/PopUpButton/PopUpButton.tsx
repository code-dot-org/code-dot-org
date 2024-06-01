import React, {useState, useCallback} from 'react';

import Button from '@cdo/apps/componentLibrary/button';

import moduleStyles from './PopUpButton.module.scss';

type PopUpButtonProps = {
  iconName: string;
  children?: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'right';
};

export const PopUpButton = ({
  children,
  iconName,
  className,
  alignment = 'left',
}: PopUpButtonProps) => {
  const [isOpen, _setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect>();
  const [offsetParent, setOffsetParent] = useState<DOMRect>();

  const setIsOpenFalse = useCallback(() => {
    _setIsOpen(false);
    document.removeEventListener('click', setIsOpenFalse);
  }, [_setIsOpen]);

  const setIsOpen = useCallback(
    (newIsOpen: boolean) => {
      _setIsOpen(newIsOpen);
      if (newIsOpen) {
        document.addEventListener('click', setIsOpenFalse);
      } else {
        document.removeEventListener('click', setIsOpenFalse);
      }
    },
    [_setIsOpen, setIsOpenFalse]
  );

  return (
    <>
      <Button
        className={className}
        size="xs"
        icon={{iconStyle: 'solid', iconName}}
        color="black"
        isIconOnly
        onClick={e => {
          setButtonRect((e.target as HTMLElement).getBoundingClientRect());
          setOffsetParent(
            (e.target as HTMLElement).offsetParent?.getBoundingClientRect()
          );
          setIsOpen(!isOpen);
        }}
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
