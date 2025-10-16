import classNames from 'classnames';
import {HTMLAttributes, useState, useRef} from 'react';

import {Button} from '@/button';

import AccountButtons, {AccountButtonsProps} from './AccountButtons';
import closeOnEvent from './hooks/closeOnEvent';
import {HeaderLink} from './types';

import moduleStyles from './header.module.scss';

export interface HamburgerMenuProps extends HTMLAttributes<HTMLElement> {
  /** Hamburger menu labels */
  hamburgerButtonLabel: {
    /** Open label */
    open: 'Open Hamburger menu' | string;
    /** Close label */
    close: 'Close Hamburger menu' | string;
    /** Menu label */
    menu: 'Hamburger menu' | string;
  };
  /** Hamburger links */
  hamburgerLinks: HeaderLink[];
  /** Account links */
  accountLinks: {
    /** Sign In button */
    signIn: AccountButtonsProps['signIn'];
    /** Create Account button */
    createAccount: AccountButtonsProps['createAccount'];
    /** Go to Dashboard button */
    goToDashboard: AccountButtonsProps['goToDashboard'];
  };
  /** Project custom class name */
  className?: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  hamburgerButtonLabel,
  hamburgerLinks,
  accountLinks,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  closeOnEvent(menuRef, () => setIsOpen(false), isOpen);

  return (
    <div
      ref={menuRef}
      className={classNames(moduleStyles.hamburgerMenuWrapper, className)}
    >
      <Button
        className={classNames(
          moduleStyles.hamburgerButton,
          moduleStyles.iconButton,
        )}
        ariaLabel={
          isOpen
            ? hamburgerButtonLabel.close || 'Close Hamburger menu'
            : hamburgerButtonLabel.open || 'Open Hamburger menu'
        }
        icon={{
          iconName: isOpen ? 'xmark' : 'bars',
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
        <nav
          className={moduleStyles.hamburgerMenu}
          aria-label={hamburgerButtonLabel.menu || 'Hamburger menu'}
        >
          <div className={moduleStyles.hamburgerButtonWrapper}>
            <AccountButtons
              signIn={accountLinks.signIn}
              createAccount={accountLinks.createAccount}
              goToDashboard={accountLinks.goToDashboard}
              isInHamburger={true}
            />
          </div>
          <ul className={moduleStyles.menu}>
            {hamburgerLinks?.map(
              ({key, href, hasDisplayLogic, label, ...link}) => (
                <li
                  key={key}
                  className={hasDisplayLogic && moduleStyles.hasDisplayLogic}
                >
                  <a href={href} {...link}>
                    {label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default HamburgerMenu;
