// Ensure critical fonts are loaded very early.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {
  Box,
  GlobalStyles,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material';
import {
  createRootRoute,
  Outlet,
  useMatches,
  useRouter,
} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import {useCallback} from 'react';

import {CdoTheme} from '@code-dot-org/component-library/themes';

import StudioFooter from '@/components/footer';
import SiteHeader from '@/components/header';
import {fetchAuthOutcome, useAuth} from '@/modules/auth';
import Bootstrap from '@/modules/bootstrap';
import {AuthErrorPage} from '@/modules/errors';

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

  // Routes opt out of the global footer via `staticData.hideFooter` (e.g. the
  // full-bleed lab route). The match is active for the whole route, so the
  // footer stays hidden through that route's loading and not-found states too.
  const hideFooter = useMatches().some(match => match.staticData.hideFooter);

  return (
    <>
      <SiteHeader />
      {/* Reserve ~a viewport for the route content so the footer starts at/below
          the fold while a route's chunk or data loads, and doesn't jump down when
          the content arrives. Layout-level concern shared by every async route;
          the offset approximates the header height. */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 50px)',
        }}
      >
        {renderRouteArea(auth, onRetry)}
      </Box>
      {!hideFooter && <StudioFooter />}
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

/** Root layout: applies the CDO MUI theme and Bootstrap providers to all routes. */
function RootLayout() {
  return (
    <StyledEngineProvider enableCssLayer>
      {cssLayerOrder}
      <ThemeProvider theme={CdoTheme}>
        {responsiveFloorStyles}
        <Bootstrap locale="en-US">
          <RootContent />
        </Bootstrap>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

/**
 * TanStack Router root route definition.
 * `beforeLoad` fetches auth once per navigation before any component renders,
 * eliminating the useEffect bootstrap pattern and StrictMode double-fetch.
 */
export const Route = createRootRoute({
  beforeLoad: async () => ({auth: await fetchAuthOutcome()}),
  component: RootLayout,
});
