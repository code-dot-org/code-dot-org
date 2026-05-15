// Ensure critical fonts are loaded very early.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {Box, ThemeProvider} from '@mui/material';
import {createRootRoute, Outlet, useMatches} from '@tanstack/react-router';
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

// Routes that take over the full viewport — no global header/footer chrome.
// Labs (canvas-based, fixed 16:9, orientation-sensitive) need every pixel
// for the activity surface.
function useChromeless(): boolean {
  const matches = useMatches();
  return matches.some(m => m.routeId.startsWith('/lab/'));
}

/** Root layout: flex column so the main content area fills the remaining viewport height. */
function RootLayout() {
  const chromeless = useChromeless();
  return (
    <ThemeProvider theme={CdoTheme}>
      <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
        <Bootstrap locale="en-US" />
        {!chromeless && (
          <Header
            logoImageUrl={CdoLogo}
            brandName="Code.org"
            menuItems={SIGNED_OUT_MENU_ITEMS}
          />
        )}
        <Box
          component="main"
          sx={{flex: 1, display: 'flex', flexDirection: 'column'}}
        >
          <Outlet />
        </Box>
        {!chromeless && <StudioFooter />}
        <TanStackRouterDevtools />
      </Box>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({component: RootLayout});
