import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import type {FunctionComponent} from 'react';

import {HEADER_BREAKPOINTS} from './breakpoints';
import CreateMenu, {type CreateMenuItem} from './CreateMenu';
import HamburgerMenu from './HamburgerMenu';
import HelpButton from './HelpButton';
import NavLogo from './NavLogo';
import NavMenu from './NavMenu';
import {UserAuthProp} from './SignedInUserButton';
import UserAuthArea from './UserAuthArea';

export type {CreateMenuItem};

/** A single navigation link entry. */
interface MenuItem {
  /** Display label for the link. */
  label: string;
  /** Destination href. */
  href: string;
}

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
}

/** Primary site navigation bar. Renders logo, nav menu, and user auth area. */
const Header: FunctionComponent<HeaderProps> = ({
  logoImageUrl,
  brandName,
  menuItems,
  userAuth,
  createMenuItems,
}) => {
  const userType =
    userAuth?.status === 'signed-in' ? userAuth.user_type : undefined;

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
          {/* Outer box has no gap — prod has 0px between auth group and help/hamburger */}
          <Box sx={{display: 'flex', alignItems: 'center', pr: '13px'}}>
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
            <HelpButton userType={userType} />
            <Box sx={{flexShrink: 0}}>
              <HamburgerMenu menuItems={menuItems} userType={userType} />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
