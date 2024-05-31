import React, {useState} from 'react';

import './PopUpButton.scss';
import Button from '@cdo/apps/componentLibrary/button';

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
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect>();
  const [offsetParent, setOffsetParent] = useState<DOMRect>();

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
          className="popup-button-menu"
          onClick={() => setIsOpen(false)}
          style={{
            top:
              buttonRect.top + buttonRect.height + 5 - (offsetParent.top || 0),
            [alignment]: buttonRect[alignment] - (offsetParent[alignment] || 0),
            //left: 100,
            //top: 100,
          }}
        >
          {children}
        </div>
      )}
    </>
  );
};
