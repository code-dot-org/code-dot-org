import {AppBar, Toolbar, Box} from '@mui/material';
import {FunctionComponent} from 'react';

import NavLogo from './NavLogo';
import NavMenu from './NavMenu';
import {UserAuthProp} from './SignedInUserButton';
import UserAuthArea from './UserAuthArea';

interface MenuItem {
  label: string;
  href: string;
}

export interface HeaderProps {
  brandName?: string;
  /** Site logo image source */
  logoImageUrl: string;
  menuItems: MenuItem[];
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
        {userAuth && <UserAuthArea userAuth={userAuth} />}
      </Toolbar>
    </AppBar>
  </Box>
);

export default Header;
