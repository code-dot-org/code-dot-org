import createCache from '@emotion/cache';
import {CacheProvider} from '@emotion/react';
import {ThemeProvider} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {
  getMuiThemeForBrand,
  resolveBrand,
} from '@code-dot-org/component-library/themes';

import SiteControls, {type PageZoom} from '@/modules/launcher/SiteControls';

// Entry for the zoom controls debug builds of the Android app show in the
// header of studio.code.org pages (vite.siteControls.config.ts). The app's
// page script loads it into every site page, which already has the CodeAI
// tokens, fonts and Font Awesome; this brings React, MUI and the theme. Its
// emotion cache has its own key: one keyed "css", like the site's, would move
// the site's styles.

const CONTAINER_ID = 'codeai-site-controls';

const zoom = (window as Window & {codeaiZoom?: PageZoom}).codeaiZoom;
const cache = createCache({key: 'codeai', prepend: true});
const theme = getMuiThemeForBrand(
  resolveBrand(document.documentElement.dataset.brand),
);
const container = document.createElement('div');
container.id = CONTAINER_ID;

// The site may render or replace its header after this runs.
function attach() {
  const headerRight = document.querySelector('.header_right');
  if (headerRight && container.parentElement !== headerRight) {
    headerRight.appendChild(container);
  }
}

if (zoom && !document.getElementById(CONTAINER_ID)) {
  attach();
  new MutationObserver(attach).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  createRoot(container).render(
    <StrictMode>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          <SiteControls zoom={zoom} />
        </ThemeProvider>
      </CacheProvider>
    </StrictMode>,
  );
}
