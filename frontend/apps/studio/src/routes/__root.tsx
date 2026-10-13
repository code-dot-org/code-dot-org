// Ensure critical fonts are loaded very early.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/shapeAndSpacingVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/brandOverrides.css';

import {Capacitor} from '@capacitor/core';
import {GlobalStyles, StyledEngineProvider, ThemeProvider} from '@mui/material';
import {createRootRoute, HeadContent, Outlet} from '@tanstack/react-router';

import {
  getMuiThemeForBrand,
  resolveBrand,
} from '@code-dot-org/component-library/themes';
import {QueryClientProvider} from '@code-dot-org/core/api';

import Bootstrap from '@/modules/bootstrap';
import {queryClient} from '@/modules/queryClient';

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

// frontend_studio/index.html.haml stamps data-brand; the Vite dev shell does not.
document.documentElement.dataset.brand = resolveBrand(
  document.documentElement.dataset.brand,
);

const theme = getMuiThemeForBrand(document.documentElement.dataset.brand);

/** Root layout: applies the CDO MUI theme and Bootstrap providers to all routes. */
function RootLayout() {
  const isNative = Capacitor.isNativePlatform();

  return (
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider enableCssLayer={!isNative}>
        <HeadContent />
        {!isNative && cssLayerOrder}
        <ThemeProvider theme={theme}>
          {responsiveFloorStyles}
          <Bootstrap locale="en-US">
            <Outlet />
          </Bootstrap>
        </ThemeProvider>
      </StyledEngineProvider>
    </QueryClientProvider>
  );
}

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
  component: RootLayout,
});
