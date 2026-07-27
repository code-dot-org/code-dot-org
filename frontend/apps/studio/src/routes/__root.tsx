// Ensure critical fonts are loaded very early.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/shapeAndSpacingVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/brandOverrides.css';

import {
  Box,
  GlobalStyles,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  useRouter,
} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import {useCallback} from 'react';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';
import {QueryClientProvider} from '@code-dot-org/core/api';

import StudioFooter from '@/components/footer';
import SiteHeader from '@/components/header';
import {
  fetchAuthOutcome,
  primeCsrfToken,
  primeCurrentUser,
  useAuth,
} from '@/modules/auth';
import Bootstrap from '@/modules/bootstrap';
import {AuthErrorPage} from '@/modules/errors';
import {queryClient} from '@/modules/queryClient';

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
      <SiteHeader />
      {/* Reserve ~a viewport for the route content so the footer starts at/below
          the fold while a route's chunk or data loads, and doesn't jump down when
          the content arrives. Layout-level concern shared by every async route;
          the offset approximates the header height. */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 50px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderRouteArea(auth, onRetry)}
      </Box>
      <StudioFooter />
      <TanStackRouterDevtools />
    </>
  );
}

// Floor the responsive layout at 360px (the modern-phone minimum; code.org's
// official requirement is 1024px desktop/Chromebook). Below 360px the page
// scrolls horizontally instead of squishing. Hoisted so it isn't re-created.
const responsiveFloorStyles = (
  <GlobalStyles styles={{body: {minWidth: '360px'}}} />
);

// Put MUI's emotion styles in an @layer so unlayered CSS (the header's
// .module.scss) wins over them without specificity hacks. The declaration sets
// the order; MUI's styles land in `mui`, below any unlayered rules.
const cssLayerOrder = (
  <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
);

const theme = getMuiThemeForBrand(document.documentElement.dataset.brand);

/** Root layout: applies the CDO MUI theme and Bootstrap providers to all routes. */
function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider enableCssLayer>
        <HeadContent />
        {cssLayerOrder}
        <ThemeProvider theme={theme}>
          {responsiveFloorStyles}
          <Bootstrap locale="en-US">
            <RootContent />
          </Bootstrap>
        </ThemeProvider>
      </StyledEngineProvider>
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
  // Declared here, not in the Rails haml or index.html, so it covers every serving mode.
  head: () => ({
    // Default document title; leaf routes override it via their own `head`.
    // HeadContent restores this when navigating back to a title-less route.
    meta: [{title: 'CodeAI'}],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: `${import.meta.env.BASE_URL}favicon.svg`,
      },
      {
        rel: 'icon',
        href: `${import.meta.env.BASE_URL}favicon.ico`,
        sizes: '32x32',
      },
    ],
  }),
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
