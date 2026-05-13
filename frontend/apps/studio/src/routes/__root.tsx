// Ensure critical fonts are loaded very early.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {Box, ThemeProvider} from '@mui/material';
import {TanStackDevtools} from '@tanstack/react-devtools';
import {ReactQueryDevtoolsPanel} from '@tanstack/react-query-devtools';
import {createRootRoute, Outlet} from '@tanstack/react-router';
import {TanStackRouterDevtoolsPanel} from '@tanstack/react-router-devtools';

import Header from '@code-dot-org/component-library/header';
import {CdoTheme} from '@code-dot-org/component-library/themes';
import {
  ApiClientProvider,
  bootstrapApiClient,
  QueryClientProvider,
} from '@code-dot-org/core/api';

import CdoLogo from '@/config/brand/assets/cdo-logo-inverse.webp';
import Bootstrap from '@/modules/bootstrap';
import {createRootStubApiClient} from '@/modules/labs/router/rootLabApiClient';

// Wrap the real api with a fallback stub for `level_properties` + `app_options`
// on lab edit routes. Lets the prototype run standalone (no live Rails) — see
// rootLabApiClient.ts for the URL detection logic.
const api = createRootStubApiClient(bootstrapApiClient());

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
          <QueryClientProvider>
            <ApiClientProvider client={api}>
              <Outlet />
            </ApiClientProvider>
            <TanStackDevtools
              plugins={[
                {
                  name: 'TanStack Query',
                  render: <ReactQueryDevtoolsPanel />,
                },
                {
                  name: 'TanStack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          </QueryClientProvider>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({component: RootLayout});
