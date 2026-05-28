import {RouterProvider} from '@tanstack/react-router';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import {injectFontAwesome} from '@code-dot-org/fonts';

import router from '@/modules/router';

// This root element is added to the page in dashboard/app/views/frontend_studio/index.html.haml via rails_vite
const mount = document.getElementById('vite-root');

if (typeof window !== 'undefined') {
  initializeCore({plugins: [localizationPlugin, observabilityPlugin]});
  injectFontAwesome();
}

if (mount) {
  const root = createRoot(mount);

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
