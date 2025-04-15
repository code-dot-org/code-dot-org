import classNames from 'classnames';
import {HTMLAttributes, useState, useRef} from 'react';

import {Button} from '@/button';

import closeOnEvent from './hooks/closeOnEvent';
import {Link} from './types';

import moduleStyles from './header.module.scss';
export interface HelpMenuProps extends HTMLAttributes<HTMLElement> {
  /** Help menu label */
  helpButtonLabel: string;
  /** Help links */
  helpLinks: Link[];
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
        ariaLabel={helpButtonLabel || 'Help menu'}
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
