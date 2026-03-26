import {RouterProvider} from '@tanstack/react-router';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {CodeStudioConfig, initializeCodeStudioConfig} from '@code-dot-org/core';
import {createRumClient} from '@code-dot-org/observability';

import router from '@/modules/router';

// This root element is added to the page in dashboard/views/app/index.html.haml via rails_vite
const mount = document.getElementById('vite-root');

initializeCodeStudioConfig();

const {rumProvider, datadog, newRelic, sentry} = CodeStudioConfig.observability;
const rumClient = createRumClient(rumProvider);
rumClient.init({
  applicationName: 'studio',
  environment: CodeStudioConfig.environment,
  version: CodeStudioConfig.appVersion,
  providerOptions: {
    applicationId: datadog?.applicationId,
    clientToken: datadog?.clientToken,
    site: 'datadoghq.com',
    licenseKey: newRelic?.licenseKey,
    applicationID: newRelic?.applicationId,
    dsn: sentry?.dsn,
  },
});

if (mount) {
  const root = createRoot(mount);

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
