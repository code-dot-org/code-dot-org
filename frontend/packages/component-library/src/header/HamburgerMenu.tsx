import classNames from 'classnames';
import {Key, AnchorHTMLAttributes, HTMLAttributes, useState} from 'react';

import {Button} from '@/button';

import AccountLinks, {AccountLinksProps} from './AccountLinks';

import moduleStyles from './header.module.scss';

export interface HamburgerMenuLink
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
}

export interface HamburgerMenuProps extends HTMLAttributes<HTMLElement> {
  /** Help menu label */
  hamburgerButtonLabel: string;
  /** Help links */
  hamburgerLinks: HamburgerMenuLink[];
  /** Account links */
  accountLinks: {
    /** Sign In button */
    signIn: AccountLinksProps['signIn'];
    /** Create Account button */
    createAccount: AccountLinksProps['createAccount'];
    /** Go to Dashboard button */
    goToDashboard: AccountLinksProps['goToDashboard'];
  };
  /** Is user logged in */
  isLoggedIn: AccountLinksProps['isLoggedIn'];
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
        ariaLabel={hamburgerButtonLabel || 'Help'}
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
            <AccountLinks
              signIn={accountLinks.signIn}
              createAccount={accountLinks.createAccount}
              goToDashboard={accountLinks.goToDashboard}
              isLoggedIn={isLoggedIn}
              isInHamburger={true}
            />
          </div>
          <ul className={moduleStyles.menu}>
            {hamburgerLinks.map(({href, label}) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default HamburgerMenu;
