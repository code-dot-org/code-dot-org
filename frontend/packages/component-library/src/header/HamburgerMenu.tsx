import classNames from 'classnames';
import {Key, AnchorHTMLAttributes, HTMLAttributes, useState} from 'react';

import {Button} from '@/button';

import AccountButtons, {AccountButtonsProps} from './AccountButtons';

import moduleStyles from './header.module.scss';

export interface HamburgerMenuLink
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
  hasDisplayLogic?: boolean;
}

export interface HamburgerMenuProps extends HTMLAttributes<HTMLElement> {
  /** Hamburger menu label */
  hamburgerButtonLabel: string;
  /** Hamburger links */
  hamburgerLinks: HamburgerMenuLink[];
  /** Account links */
  accountLinks: {
    /** Sign In button */
    signIn: AccountButtonsProps['signIn'];
    /** Create Account button */
    createAccount: AccountButtonsProps['createAccount'];
    /** Go to Dashboard button */
    goToDashboard: AccountButtonsProps['goToDashboard'];
  };
  /** Is user logged in */
  isLoggedIn: AccountButtonsProps['isLoggedIn'];
  /** Project custom class name */
  className?: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  hamburgerButtonLabel,
  hamburgerLinks,
  accountLinks,
  isLoggedIn = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className={classNames(
          moduleStyles.hamburgerButton,
          moduleStyles.iconButton,
          className,
        )}
        ariaLabel={hamburgerButtonLabel || 'Hamburger menu'}
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
        <div className={moduleStyles.hamburgerMenu}>
          <div className={moduleStyles.hamburgerButtonWrapper}>
            <AccountButtons
              signIn={accountLinks.signIn}
              createAccount={accountLinks.createAccount}
              goToDashboard={accountLinks.goToDashboard}
              isLoggedIn={isLoggedIn}
              isInHamburger={true}
            />
          </div>
          <ul className={moduleStyles.menu}>
            {hamburgerLinks.map(
              ({key, href, hasDisplayLogic, label, ...link}) => (
                <li
                  key={key}
                  className={
                    hasDisplayLogic ? moduleStyles.hasDisplayLogic : ''
                  }
                >
                  <a href={href} {...link}>
                    {label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default HamburgerMenu;
