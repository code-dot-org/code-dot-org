import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {Image, ImageProps} from '@/image';

import AccountButtons, {AccountButtonsProps} from './AccountButtons';
import HamburgerMenu, {HamburgerMenuProps} from './HamburgerMenu';
import HelpMenu, {HelpMenuProps} from './HelpMenu';
import MainLinks, {MainLinksProps} from './MainLinks';
import ProjectsMenu, {ProjectsMenuProps} from './ProjectsMenu';

import moduleStyles from './header.module.scss';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Home link */
  homeLink: {
    /** Home link url */
    href: string;
    /** Home link aria-label */
    ariaLabel: string;
  };
  /** Site logo */
  logo: Pick<ImageProps, 'src' | 'altText'>;
  /** Nav labels */
  navLabel: {
    /** Main nav label */
    main: 'Main navigation' | string;
    /** Secondary nav label */
    secondary: 'Secondary navigation' | string;
  };
  /** Main links label */
  mainLinksLabel: MainLinksProps['mainLinksLabel'];
  /** Main links */
  mainLinks: MainLinksProps['mainLinks'];
  /** Projects button label */
  projectsButtonLabel: ProjectsMenuProps['projectsButtonLabel'];
  /** Projects button aria-label */
  projectsButtonAriaLabel: {
    /** Open label */
    open: 'Open Projects menu' | string;
    /** Close label */
    close: 'Close Projects menu' | string;
    /** Menu label */
    menu: 'Projects menu' | string;
  };
  /** Projects menu links */
  projectsLinks: ProjectsMenuProps['projectsLinks'];
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
  /** Help menu label */
  helpButtonLabel: HelpMenuProps['helpButtonLabel'];
  /** Help menu links */
  helpLinks: HelpMenuProps['helpLinks'];
  /** Hamburger menu label */
  hamburgerButtonLabel: HamburgerMenuProps['hamburgerButtonLabel'];
  /** Hamburger menu links */
  hamburgerLinks: HamburgerMenuProps['hamburgerLinks'];
  /** Header custom class name */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Header.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Header Component.
 * Acts as the main page header navigation.
 */
const Header: React.FC<HeaderProps> = ({
  homeLink,
  logo,
  navLabel,
  mainLinksLabel,
  mainLinks,
  projectsButtonLabel,
  projectsButtonAriaLabel,
  projectsLinks,
  accountLinks,
  isLoggedIn = false,
  helpButtonLabel,
  helpLinks,
  hamburgerButtonLabel,
  hamburgerLinks,
  className,
  ...HTMLAttributes
}) => (
  <header
    {...HTMLAttributes}
    className={classNames(moduleStyles.headerNavigation, className)}
  >
    <nav
      className={moduleStyles.mainLinksWrapper}
      aria-label={navLabel.main || 'Main navigation'}
    >
      <a
        href={homeLink.href}
        className={moduleStyles.homeLink}
        aria-label={homeLink.ariaLabel}
      >
        <Image src={logo.src} alt={logo.altText} loading={'eager'} />
      </a>
      <MainLinks mainLinksLabel={mainLinksLabel} mainLinks={mainLinks} />
    </nav>

    <nav
      className={moduleStyles.buttonLinks}
      aria-label={navLabel.secondary || 'Secondary navigation'}
    >
      <ProjectsMenu
        projectsLinks={projectsLinks}
        projectsButtonLabel={projectsButtonLabel}
        projectsButtonAriaLabel={projectsButtonAriaLabel}
      />
      <AccountButtons
        signIn={accountLinks.signIn}
        createAccount={accountLinks.createAccount}
        goToDashboard={accountLinks.goToDashboard}
        isLoggedIn={isLoggedIn}
        isInHamburger={false}
      />
      <HelpMenu helpButtonLabel={helpButtonLabel} helpLinks={helpLinks} />
      <HamburgerMenu
        hamburgerButtonLabel={hamburgerButtonLabel}
        hamburgerLinks={hamburgerLinks}
        accountLinks={accountLinks}
        isLoggedIn={isLoggedIn}
      />
    </nav>
  </header>
);

export default Header;
