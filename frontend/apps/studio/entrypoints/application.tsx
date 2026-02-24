import {RouterProvider} from '@tanstack/react-router';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCodeStudioConfig} from '@code-dot-org/core';

import router from '@/modules/router';

// This root element is added to the page in dashboard/views/app/index.html.haml via rails_vite
const mount = document.getElementById('vite-root');

initializeCodeStudioConfig();
console.log(window.__CODE_STUDIO__);

if (mount) {
  const root = createRoot(mount);

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
