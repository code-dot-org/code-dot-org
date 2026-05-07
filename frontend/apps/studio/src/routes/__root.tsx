// Ensure critical fonts are loaded very early.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {Box, ThemeProvider} from '@mui/material';
import {createRootRoute, Outlet} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';

import Header from '@code-dot-org/component-library/header';
import {CdoTheme} from '@code-dot-org/component-library/themes';

import StudioFooter from '@/components/footer';
import CdoLogo from '@/config/brand/assets/cdo-logo-inverse.webp';
import Bootstrap from '@/modules/bootstrap';

const SIGNED_OUT_MENU_ITEMS = [
  {label: 'Learn', href: '/students'},
  {label: 'Teach', href: '/teach'},
  {label: 'Districts', href: '/administrators'},
  {label: 'Stats', href: '/promote'},
  {label: 'Donate', href: '/donate'},
  {label: 'Incubator', href: '/incubator'},
  {label: 'About', href: '/about'},
];

/** Root layout: flex column so the main content area fills the remaining viewport height. */
function RootLayout() {
  return (
    <ThemeProvider theme={CdoTheme}>
      <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
        <Bootstrap locale="en-US" />
        <Header
          logoImageUrl={CdoLogo}
          brandName="Code.org"
          menuItems={SIGNED_OUT_MENU_ITEMS}
        />
        <Box
          component="main"
          sx={{flex: 1, display: 'flex', flexDirection: 'column'}}
        >
          <Outlet />
        </Box>
        <StudioFooter />
        <TanStackRouterDevtools />
      </Box>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({component: RootLayout});
