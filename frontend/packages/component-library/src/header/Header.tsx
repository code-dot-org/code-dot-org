import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import type {FunctionComponent} from 'react';

import NavLogo from './NavLogo';
import NavMenu from './NavMenu';
import {UserAuthProp} from './SignedInUserButton';
import UserAuthArea from './UserAuthArea';

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
  /** Ordered list of navigation links to render in the menu. */
  menuItems: MenuItem[];
  /** Current auth status; omit to hide the user auth area entirely. */
  userAuth?: UserAuthProp;
}

/** Primary site navigation bar. Renders logo, nav menu, and user auth area. */
const Header: FunctionComponent<HeaderProps> = ({
  logoImageUrl,
  brandName,
  menuItems,
  userAuth,
}) => (
  <Box component="header">
    <AppBar
      component="nav"
      elevation={0}
      position="relative"
      aria-label="Main navigation"
      sx={{backgroundColor: 'var(--background-brand-teal-primary)'}}
    >
      <Toolbar variant="dense" disableGutters sx={{alignItems: 'stretch'}}>
        <NavLogo logoImageUrl={logoImageUrl} brandName={brandName} />
        <NavMenu menuItems={menuItems} />
        {userAuth ? <UserAuthArea userAuth={userAuth} /> : null}
      </Toolbar>
    </AppBar>
  </Box>
);

export default Header;
