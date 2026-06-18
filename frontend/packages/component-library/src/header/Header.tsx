import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import type {FunctionComponent} from 'react';

import CreateMenu, {
  type CreateMenuItem,
} from './components/CreateMenu/CreateMenu';
import HamburgerMenu from './components/HamburgerMenu/HamburgerMenu';
import HelpButton from './components/HelpButton/HelpButton';
import NavLogo from './components/NavLogo/NavLogo';
import NavMenu from './components/NavMenu/NavMenu';
import {UserAuthProp} from './components/SignedInUserButton/SignedInUserButton';
import UserAuthArea from './components/UserAuthArea/UserAuthArea';
import type {GlobalNavItem, MenuItem} from './shared/types';

import moduleStyles from './Header.module.scss';

export type {CreateMenuItem};

/** Props for {@link Header}. */
export interface HeaderProps {
  /** Brand name used for logo aria-label and alt text. */
  brandName?: string;
  /** URL of the brand logo image. */
  logoImageUrl: string;
  /** Ordered list of navigation links shown in the top bar and hamburger drawer. */
  menuItems: MenuItem[];
  /** Current auth status; omit to hide the user auth area entirely. */
  userAuth?: UserAuthProp;
  /** Project types shown in the "New project +" dropdown; omit to hide that button. */
  createMenuItems?: CreateMenuItem[];
  /** Site-wide nav shown in the hamburger drawer; omit to hide that section. */
  globalNavItems?: GlobalNavItem[];
  /** Help/support links shown in the help menu and hamburger drawer. */
  supportLinks?: MenuItem[];
}

/** Primary site navigation bar. Renders logo, nav menu, and user auth area. */
const Header: FunctionComponent<HeaderProps> = ({
  logoImageUrl,
  brandName,
  menuItems,
  userAuth,
  createMenuItems,
  globalNavItems = [],
  supportLinks = [],
}) => {
  // Top bar nav: the app nav when signed in; when there's no app nav (signed
  // out), the site nav flattened to links — a group links to its overview (its
  // first sub-item's href) — matching prod's signed-out bar.
  const barNavItems: MenuItem[] = menuItems.length
    ? menuItems
    : globalNavItems
        .filter(item => !item.hamburgerOnly)
        .flatMap(item => {
          // A group links to its overview (first sub-item's href). Drop entries
          // that resolve to no real href rather than render a broken '#' link.
          const href = item.href ?? item.subItems?.[0]?.href;
          return href ? [{label: item.label, href}] : [];
        });

  return (
    <Box component="header">
      <AppBar
        component="nav"
        elevation={0}
        position="relative"
        aria-label="Main navigation"
        className={moduleStyles.appBar}
      >
        <Toolbar
          variant="dense"
          disableGutters
          className={moduleStyles.toolbar}
        >
          <NavLogo logoImageUrl={logoImageUrl} brandName={brandName} />
          <NavMenu menuItems={barNavItems} />

          {/* Flex spacer pushes right items to the edge */}
          <Box className={moduleStyles.spacer} />

          {/* Right cluster: create → auth → help → hamburger (matches prod order) */}
          <Box className={moduleStyles.rightCluster}>
            <Box className={moduleStyles.createAuth}>
              {createMenuItems && createMenuItems.length > 0 && (
                <CreateMenu items={createMenuItems} />
              )}
              {userAuth && (
                <Box className={moduleStyles.authArea}>
                  <UserAuthArea userAuth={userAuth} />
                </Box>
              )}
            </Box>
            {supportLinks.length > 0 && (
              <HelpButton supportLinks={supportLinks} />
            )}
            <Box className={moduleStyles.hamburgerWrap}>
              <HamburgerMenu
                menuItems={menuItems}
                globalNavItems={globalNavItems}
                supportLinks={supportLinks}
                userAuth={userAuth}
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
