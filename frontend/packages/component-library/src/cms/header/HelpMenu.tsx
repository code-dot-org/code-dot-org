import classNames from 'classnames';
import {HTMLAttributes, useState, useRef} from 'react';

import {Button} from '@/button';

import closeOnEvent from './hooks/closeOnEvent';
import {HeaderLink} from './types';

import moduleStyles from './header.module.scss';

export interface HelpMenuProps extends HTMLAttributes<HTMLElement> {
  /** Help menu labels */
  helpButtonLabel: {
    /** Open label */
    open: 'Open Help menu' | string;
    /** Close label */
    close: 'Close Help menu' | string;
    /** Menu label */
    menu: 'Help menu' | string;
  };
  /** Help links */
  helpLinks: HeaderLink[];
  /** Project custom class name */
  className?: string;
}

const HelpMenu: React.FC<HelpMenuProps> = ({
  helpButtonLabel,
  helpLinks,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  closeOnEvent(menuRef, () => setIsOpen(false), isOpen);

  return (
    <div
      ref={menuRef}
      className={classNames(moduleStyles.helpMenuWrapper, className)}
    >
      <Button
        className={classNames(moduleStyles.helpButton, moduleStyles.iconButton)}
        ariaLabel={
          isOpen
            ? helpButtonLabel.close || 'Close Help menu'
            : helpButtonLabel.open || 'Open Help menu'
        }
        icon={{
          iconName: 'question-circle',
          iconStyle: 'solid',
        }}
        isIconOnly
        type="primary"
        size="l"
        onClick={() => {
          setIsOpen(prev => !prev);
        }}
      />

      {isOpen && (
        <ul
          className={classNames(
            moduleStyles.menu,
            moduleStyles.helpMenu,
            className,
          )}
          aria-label={helpButtonLabel.menu || 'Help menu'}
        >
          {helpLinks.map(({key, href, label, ...link}) => (
            <li key={key}>
              <a href={href} {...link}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HelpMenu;
