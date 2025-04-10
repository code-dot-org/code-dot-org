import classNames from 'classnames';
import {Key, HTMLAttributes, AnchorHTMLAttributes, useState} from 'react';

import {Button, LinkButton} from '@/button';

import moduleStyles from './header.module.scss';

export interface SiteLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
}

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Site logo */
  logo: string;
  /** Header links */
  siteLinks: SiteLink[];
  /** Button labels */
  buttonLabel: {
    /** New project label */
    newProject: 'New project' | string;
    /** Sign in label */
    signIn: 'Sign in' | string;
    /** Create account label */
    createAccount: 'Create account' | string;
    /** Go to dashboard label */
    goToDashboard: 'Go to dashboard' | string;
  };
  /** Is user logged in */
  isLoggedIn?: boolean;
  /** Header custom class name */
  className?: string;
}

const getNewProjectMenu = ({
  buttonLabel,
}: {
  buttonLabel: HeaderProps['buttonLabel'];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Button
      text={buttonLabel.newProject}
      className={classNames(moduleStyles.newProject)}
      type="secondary"
      size="s"
      color="white"
      iconRight={{
        iconName: isOpen ? 'caret-up' : 'caret-down',
        iconStyle: 'solid',
      }}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
    />
  );
};

const Header: React.FC<HeaderProps> = ({
  logo,
  siteLinks,
  buttonLabel,
  isLoggedIn = false,
  className,
  ...HTMLAttributes
}) => (
  <nav
    {...HTMLAttributes}
    className={classNames(moduleStyles.headerNavigation, className)}
  >
    <div className={moduleStyles.mainLinks}>
      <img src={logo} alt="Code.org" />
      <ul aria-label="Main site links">
        {siteLinks?.map(({key, label, href, ...link}) => (
          <li key={key}>
            <a href={href} {...link}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div className={moduleStyles.buttonLinks}>
      {getNewProjectMenu({buttonLabel})}
      <LinkButton
        text={buttonLabel.signIn}
        className={classNames(moduleStyles.signIn)}
        type="secondary"
        href="https://studio.code.org/users/sign_in"
        size="s"
        color="white"
      />
      <LinkButton
        text={buttonLabel.createAccount}
        className={classNames(moduleStyles.createAccount)}
        type="primary"
        href="https://studio.code.org/users/sign_up/account_type"
        size="s"
        color="white"
      />
      {!isLoggedIn && (
        <LinkButton
          text={buttonLabel.goToDashboard}
          className={classNames(moduleStyles.goToDashboard)}
          type="primary"
          href="https://studio.code.org/users/sign_up/account_type"
          size="s"
          color="white"
          iconRight={{
            iconName: 'arrow-right-to-line',
            iconStyle: 'solid',
          }}
        />
      )}
    </div>
  </nav>
);

export default Header;
