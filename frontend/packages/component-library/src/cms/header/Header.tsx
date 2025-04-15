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
    url: string;
    /** Home link aria-label */
    ariaLabel: string;
  };
  /** Site logo */
  logo: Pick<ImageProps, 'src' | 'altText'>;
  /** Header links */
  mainLinks: MainLinksProps['mainLinks'];
  /** Projects button label */
  projectsButtonLabel: string;
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

const Header: React.FC<HeaderProps> = ({
  homeLink,
  logo,
  mainLinks,
  projectsButtonLabel,
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
  <nav
    {...HTMLAttributes}
    className={classNames(moduleStyles.headerNavigation, className)}
  >
    <div className={moduleStyles.mainLinksWrapper}>
      <a
        href={homeLink.url}
        className={moduleStyles.homeLink}
        aria-label={homeLink.ariaLabel}
      >
        <Image src={logo.src} alt={logo.altText} loading={'eager'} />
      </a>
      <MainLinks mainLinks={mainLinks} />
    </div>

    <div className={moduleStyles.buttonLinks}>
      <ProjectsMenu
        projectsLinks={projectsLinks}
        projectsButtonLabel={projectsButtonLabel}
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
    </div>
  </nav>
);

export default Header;
