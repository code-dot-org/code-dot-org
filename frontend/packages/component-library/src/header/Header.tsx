import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {Image} from '@/image';

import AccountLinks, {AccountLinksProps} from './AccountLinks';
import HelpMenu, {HelpMenuProps} from './HelpMenu';
import MainLinks, {MainLinksProps} from './MainLinks';
import ProjectsMenu, {ProjectsMenuProps} from './ProjectsMenu';

import moduleStyles from './header.module.scss';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Site logo */
  logo: string;
  /** Header links */
  mainLinks: MainLinksProps['mainLinks'];
  /** Projects button label */
  projectsButtonLabel: string;
  /** Projects menu links */
  projectsLinks: ProjectsMenuProps['projectsLinks'];
  /** Account links */
  accountLinks: {
    /** Sign In button */
    signIn: AccountLinksProps['signIn'];
    /** Create Account button */
    createAccount: AccountLinksProps['createAccount'];
    /** Go to Dashboard button */
    goToDashboard: AccountLinksProps['goToDashboard'];
  };
  /** Help menu label */
  helpMenuLabel: HelpMenuProps['helpMenuLabel'];
  /** Help menu links */
  helpLinks: HelpMenuProps['helpLinks'];
  /** Header custom class name */
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  logo,
  mainLinks,
  projectsButtonLabel,
  projectsLinks,
  accountLinks,
  helpMenuLabel,
  helpLinks,
  className,
  ...HTMLAttributes
}) => (
  <nav
    {...HTMLAttributes}
    className={classNames(moduleStyles.headerNavigation, className)}
  >
    <a href="/" className={moduleStyles.logo} aria-label="Go to home">
      <Image src={logo} alt={'Code.org logo'} loading={'eager'} />
    </a>

    <MainLinks mainLinks={mainLinks} />

    <div className={moduleStyles.buttonLinks}>
      <ProjectsMenu
        projectsLinks={projectsLinks}
        projectsButtonLabel={projectsButtonLabel}
      />
      <AccountLinks
        signIn={accountLinks.signIn}
        createAccount={accountLinks.createAccount}
        goToDashboard={accountLinks.goToDashboard}
        isLoggedIn={false}
      />
      <HelpMenu helpMenuLabel={helpMenuLabel} helpLinks={helpLinks} />
    </div>
  </nav>
);

export default Header;
