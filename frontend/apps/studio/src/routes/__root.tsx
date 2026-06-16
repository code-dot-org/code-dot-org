// Ensure critical fonts are loaded very early.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {Box, ThemeProvider} from '@mui/material';
import {createRootRoute, Outlet, useRouter} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import {useCallback} from 'react';

import Header from '@code-dot-org/component-library/header';
import {CdoTheme} from '@code-dot-org/component-library/themes';
import {QueryClientProvider} from '@code-dot-org/core/api';

import StudioFooter from '@/components/footer';
import CdoLogo from '@/config/brand/assets/cdo-logo-inverse.webp';
import {
  fetchAuthOutcome,
  primeCsrfToken,
  primeCurrentUser,
  useAuth,
} from '@/modules/auth';
import Bootstrap from '@/modules/bootstrap';
import {AuthErrorPage} from '@/modules/errors';
import {queryClient} from '@/modules/queryClient';

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
 * Maps auth status to the route content area.
 * Returns the outlet for non-error states; the auth error page on failure.
 *
 * @param auth - Current auth outcome from the root route context.
 * @param onRetry - Calls `router.invalidate()` to re-run `beforeLoad`.
 * @returns The content node for the current auth status.
 */
function renderRouteArea(
  auth: ReturnType<typeof useAuth>,
  onRetry: () => void,
): React.ReactNode {
  switch (auth.status) {
    case 'signed-in':
    case 'signed-out':
      return <Outlet />;
    case 'error':
      return (
        <AuthErrorPage
          onRetry={onRetry}
          observabilityEventId={auth.observabilityEventId}
        />
      );
    default: {
      const _: never = auth;
      throw new Error(`Unhandled auth status: ${JSON.stringify(_)}`);
    }
  }
}

/**
 * Renders the page shell: header, route content area, and devtools.
 * Auth state drives both the header user area and the content area.
 * `onRetry` calls `router.invalidate()` to re-run `beforeLoad`.
 */
function RootContent() {
  const auth = useAuth();
  const router = useRouter();
  const onRetry = useCallback(() => router.invalidate(), [router]);

  return (
    <>
      <Header
        logoImageUrl={CdoLogo}
        brandName="Code.org"
        menuItems={MENU_ITEMS}
        userAuth={auth}
      />
      {/* Hold the content area open (minus the header height) so the footer
          doesn't jump down when an async route's chunk or data arrives. */}
      <Box sx={{minHeight: 'calc(100vh - 48px)'}}>
        {renderRouteArea(auth, onRetry)}
      </Box>
      <StudioFooter />
      <TanStackRouterDevtools />
    </>
  );
}

/** Root layout: applies the CDO MUI theme and Bootstrap providers to all routes. */
function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={CdoTheme}>
        <Bootstrap locale="en-US">
          <RootContent />
        </Bootstrap>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/**
 * TanStack Router root route definition.
 * `beforeLoad` fetches auth once per navigation before any component renders,
 * eliminating the useEffect bootstrap pattern and StrictMode double-fetch. The
 * resolved user primes the shared query cache so feature modules read it via
 * `useCurrentUser` without a second request.
 */
export const Route = createRootRoute({
  beforeLoad: async () => {
    const auth = await fetchAuthOutcome();
    primeCurrentUser(queryClient, auth);
    // Prime a CSRF token when the shell lacks the meta, so mutations work on a
    // hard load of a subroute (and after the sign-in redirect returns here).
    await primeCsrfToken();
    return {auth};
  },
  component: RootLayout,
});
