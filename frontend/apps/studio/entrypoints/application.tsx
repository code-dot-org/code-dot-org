import {RouterProvider} from '@tanstack/react-router';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {observabilityPlugin} from '@code-dot-org/observability/plugin';

import router from '@/modules/router';

// This root element is added to the page in dashboard/views/app/index.html.haml via rails_vite
const mount = document.getElementById('vite-root');

// Guard for SSR safety (Req 6.2) — only initialize in browser environments
if (typeof window !== 'undefined') {
  initializeCore([observabilityPlugin]);
}

if (mount) {
  const root = createRoot(mount);

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
