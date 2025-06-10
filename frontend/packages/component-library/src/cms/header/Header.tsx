import classNames from 'classnames';
import {HTMLAttributes, useEffect, useState} from 'react';

import {Image, ImageProps} from '@/image';

import AccountButtons, {AccountButtonsProps} from './AccountButtons';
import SignInContext from './context/signInContext';
import HamburgerMenu, {HamburgerMenuProps} from './HamburgerMenu';
import HelpMenu, {HelpMenuProps} from './HelpMenu';
import MainLinks, {MainLinksProps} from './MainLinks';
import ProjectsMenu, {ProjectsMenuProps} from './ProjectsMenu';

import moduleStyles from './header.module.scss';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Studio.code.org base url
   * sets correct stage for use with user signed_in api */
  studioBaseUrl: string;
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
const fetchUserSignedInStatus = async (studioBaseUrl: string) => {
  try {
    const signedInStatus = await fetch(
      `${studioBaseUrl}/api/v1/users/signed_in`,
      {
        credentials: 'include',
      },
    );

    if (!signedInStatus.ok) {
      throw new Error(
        `Received HTTP Code ${signedInStatus.status} while fetching signed in status`,
      );
    }

    return await signedInStatus.json();
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
};

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
  studioBaseUrl,
  homeLink,
  logo,
  navLabel,
  mainLinksLabel,
  mainLinks,
  projectsButtonLabel,
  projectsButtonAriaLabel,
  projectsLinks,
  accountLinks,
  helpButtonLabel,
  helpLinks,
  hamburgerButtonLabel,
  hamburgerLinks,
  className,
  ...HTMLAttributes
}) => {
  const [renderState, setRenderState] = useState<
    'loading' | 'signedIn' | 'signedOut' | 'error'
  >('loading');

  useEffect(() => {
    async function getUserStatus() {
      try {
        const data = await fetchUserSignedInStatus(studioBaseUrl);
        if (data) {
          const renderState = data.is_signed_in ? 'signedIn' : 'signedOut';
          setRenderState(renderState);
        } else {
          setRenderState('error');
        }
      } catch (error) {
        console.error('Error fetching user signed in status:', error);
      }
    }

    getUserStatus();
  }, [studioBaseUrl]);

  return (
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
        <SignInContext.Provider value={renderState}>
          <AccountButtons
            signIn={accountLinks.signIn}
            createAccount={accountLinks.createAccount}
            goToDashboard={accountLinks.goToDashboard}
            isInHamburger={false}
          />
          <HelpMenu helpButtonLabel={helpButtonLabel} helpLinks={helpLinks} />
          <HamburgerMenu
            hamburgerButtonLabel={hamburgerButtonLabel}
            hamburgerLinks={hamburgerLinks}
            accountLinks={accountLinks}
          />
        </SignInContext.Provider>
      </nav>
    </header>
  );
};

export default Header;
