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
import {useAuth} from '@/modules/auth';
import Bootstrap from '@/modules/bootstrap';
import {AuthErrorPage} from '@/modules/errors';

/** Top-level navigation items shared across all routes. */
const MENU_ITEMS = [
  {label: 'Learn', href: '/students'},
  {label: 'Teach', href: '/teach'},
  {label: 'Districts', href: '/administrators'},
  {label: 'Stats', href: '/promote'},
  {label: 'Donate', href: '/donate'},
  {label: 'Incubator', href: '/incubator'},
  {label: 'About', href: '/about'},
];

/**
 * Renders the page body based on auth status.
 * Shows the route outlet while loading or authenticated; shows the auth error
 * page on failure so the user can retry without a full page reload.
 */
function RootContent() {
  const auth = useAuth();

  let routeArea: React.ReactNode;
  switch (auth.status) {
    case 'loading':
    case 'signedIn':
    case 'signedOut':
      routeArea = <Outlet />;
      break;
    case 'error':
      routeArea = (
        <AuthErrorPage onRetry={auth.onRetry} eventId={auth.eventId} />
      );
      break;
    default: {
      const _: never = auth;
      throw new Error(`Unhandled auth status: ${JSON.stringify(_)}`);
    }
  }

  return (
    <>
      <Header
        logoImageUrl={CdoLogo}
        brandName="Code.org"
        menuItems={MENU_ITEMS}
        userAuth={auth}
      />
      {routeArea}
      <TanStackRouterDevtools />
    </>
  );
}

/** Root layout: applies the CDO MUI theme and Bootstrap providers to all routes. */
function RootLayout() {
  return (
    <ThemeProvider theme={CdoTheme}>
      <Bootstrap locale="en-US">
        <RootContent />
      </Bootstrap>
    </ThemeProvider>
  );
}

/** TanStack Router root route definition. */
export const Route = createRootRoute({component: RootLayout});
