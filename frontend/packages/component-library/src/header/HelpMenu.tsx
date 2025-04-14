import classNames from 'classnames';
import {Key, AnchorHTMLAttributes, HTMLAttributes, useState} from 'react';

import {Button} from '@/button';

import moduleStyles from './header.module.scss';

export interface HelpLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
}

export interface HelpMenuProps extends HTMLAttributes<HTMLElement> {
  /** Help menu label */
  helpButtonLabel: string;
  /** Help links */
  helpLinks: HelpLink[];
  /** Project custom class name */
  className?: string;
}

const HelpMenu: React.FC<HelpMenuProps> = ({
  helpButtonLabel,
  helpLinks,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className={classNames(
          moduleStyles.helpButton,
          moduleStyles.iconButton,
          className,
        )}
        ariaLabel={helpButtonLabel || 'Help menu'}
        icon={{
          iconName: 'question-circle',
          iconStyle: 'solid',
        }}
        isIconOnly
        type="primary"
        size="l"
        onClick={() => {
          setIsOpen(!isOpen);
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
    </>
  );
};

export default HelpMenu;
