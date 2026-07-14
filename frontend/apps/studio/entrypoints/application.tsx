import {QueryClientProvider} from '@tanstack/react-query';
import {RouterProvider} from '@tanstack/react-router';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import {injectFontAwesome} from '@code-dot-org/fonts';

import {enableMocks} from '@/modules/mocks/enableMocks';
import router from '@/modules/router';
import queryClient from '@/modules/router/queryClient';

// This root element is added to the page in dashboard/app/views/frontend_studio/index.html.haml via rails_vite
const mount = document.getElementById('vite-root');

if (typeof window !== 'undefined') {
  initializeCore({plugins: [localizationPlugin, observabilityPlugin]});
  // Import FontAwesome into the `base` layer (declared below `mui` in
  // __root.tsx) so MUI's layered styleOverrides win over FA's base icon rules.
  injectFontAwesome({layer: 'base'});
}

// MSW (if enabled via VITE_API_MODE=msw) must be running before any fetch
// fires, including the lab's initial level_properties / theme calls. The
// service worker registers async, so we await it before mounting.
await enableMocks();

if (mount) {
  const root = createRoot(mount);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
