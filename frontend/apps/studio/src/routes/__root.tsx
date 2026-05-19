// Ensure critical fonts are loaded very early.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {Box, ThemeProvider} from '@mui/material';
import {createRootRoute, Outlet, useRouterState} from '@tanstack/react-router';
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
  // Hide the studio header AND footer inside a lab/project OR inside the
  // mobile AI Decisions experience (`/m/...`).  Both surfaces are
  // intended to own their own full-bleed chrome — the desktop header
  // (Learn/Teach/Districts/...) and the legal footer eat scarce vertical
  // real estate on a phone, pushing the actual activity below the fold.
  const hideChrome = useRouterState({
    select: state =>
      state.location.pathname.includes('/projects/') ||
      state.location.pathname.includes('/m/'),
  });

  return (
    <ThemeProvider theme={CdoTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // Use `height` (not `minHeight`) so the flex chain has a definite
          // block-size all the way down. Routes whose layout queries the
          // available height — e.g. the oceans lab using `100cqb` container
          // queries — return 0 unless every ancestor has a definite height.
          // `100dvh` (dynamic viewport height) handles mobile browser chrome
          // resizing the visible area.
          height: '100dvh',
          // Respect iOS notch / Android cutout. viewport-fit=cover in index.html
          // enables env() values; without these the header overlaps the status bar.
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Bootstrap locale="en-US" />
        {!hideChrome && (
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
        {!hideChrome && <StudioFooter />}
        <TanStackRouterDevtools />
      </Box>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({component: RootLayout});
