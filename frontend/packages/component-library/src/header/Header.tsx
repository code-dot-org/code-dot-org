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
import {HEADER_BREAKPOINTS} from './shared/breakpoints';
import type {GlobalNavItem, MenuItem} from './shared/types';

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
  return (
    <Box component="header">
      <AppBar
        component="nav"
        elevation={0}
        position="relative"
        aria-label="Main navigation"
        sx={{backgroundColor: 'var(--background-brand-teal-primary)'}}
      >
        <Toolbar
          variant="dense"
          disableGutters
          sx={{'&&': {minHeight: '50px'}, alignItems: 'stretch'}}
        >
          <NavLogo logoImageUrl={logoImageUrl} brandName={brandName} />
          <NavMenu menuItems={menuItems} />

          {/* Flex spacer pushes right items to the edge */}
          <Box sx={{flex: 1}} />

          {/* Right cluster: create → auth → help → hamburger (matches prod order) */}
          {/* 6px gap keeps each icon target clear of its neighbor (WCAG 2.5.8
              spacing); prod packs these flush, so the space beside the name opens Help. */}
          <Box
            sx={{display: 'flex', alignItems: 'center', gap: '6px', pr: '13px'}}
          >
            {/* Create + auth share an 8px gap between them, matching prod */}
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              {createMenuItems && createMenuItems.length > 0 && (
                <CreateMenu items={createMenuItems} />
              )}
              {userAuth && (
                <Box
                  sx={{
                    display: 'none',
                    [`@media (min-width:${HEADER_BREAKPOINTS.mobileAuth}px)`]: {
                      display: 'flex',
                      alignSelf: 'stretch',
                      alignItems: 'stretch',
                    },
                  }}
                >
                  <UserAuthArea userAuth={userAuth} />
                </Box>
              )}
            </Box>
            {supportLinks.length > 0 && (
              <HelpButton supportLinks={supportLinks} />
            )}
            <Box sx={{flexShrink: 0}}>
              <HamburgerMenu
                menuItems={menuItems}
                globalNavItems={globalNavItems}
                supportLinks={supportLinks}
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
