import type {ReactNode} from 'react';

import {
  ApiClientProvider,
  QueryClientProvider,
  DashboardApiClient,
} from '@code-dot-org/core/api';
import {RootStateProvider} from '@code-dot-org/core/redux';

/** Props for {@link LabProviders}. */
interface LabProvidersProps {
  /** Lab subtree to render inside the data providers. */
  children: ReactNode;
}

/**
 * The data-provider stack a `@code-dot-org/lab`-based lab requires from its
 * host: the shared redux store, a react-query client, and the dashboard API
 * client. Studio owns these (the lab does not provide them); they live at the
 * lab route boundary rather than studio root so non-lab routes — and the
 * propless skeleton labs — stay free of redux/react-query.
 *
 * `RootStateProvider` wraps the shared core store (it lives in
 * `@code-dot-org/core/redux`, not the lab package); importing
 * `@code-dot-org/lab` injects the lab slices into it. The base hooks read the API client from
 * context via `useApiClient`, so studio's existing singleton
 * (`DashboardApiClient`) is fed in here.
 */
export default function LabProviders({children}: LabProvidersProps) {
  return (
    <RootStateProvider>
      <QueryClientProvider>
        <ApiClientProvider client={DashboardApiClient}>
          {children}
        </ApiClientProvider>
      </QueryClientProvider>
    </RootStateProvider>
  );
}
