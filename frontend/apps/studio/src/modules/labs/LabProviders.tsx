import type {ReactNode} from 'react';

import {
  ApiClientProvider,
  QueryClientProvider,
  DashboardApiClient,
} from '@code-dot-org/core/api';
import {RootStateProvider} from '@code-dot-org/lab-classic';

/** Props for {@link LabProviders}. */
interface LabProvidersProps {
  /** Lab subtree to render inside the data providers. */
  children: ReactNode;
}

/**
 * The data-provider stack a `@code-dot-org/lab-classic`-based lab requires
 * from its host: the shared redux store, a react-query client, and the
 * dashboard API client. Scoped to fat-lab mounts (music) only — staging's
 * slim `@code-dot-org/lab` (oceans, standalone_video) needs none of this and
 * stays on its prop-driven `<Lab levelId levelPropertiesMap>` contract
 * untouched; non-lab routes and the propless skeleton labs stay free of
 * redux/react-query too.
 *
 * `RootStateProvider` wraps the shared core store; importing
 * `@code-dot-org/lab-classic` injects the lab slices into it. The base hooks
 * read the API client from context via `useApiClient`, so studio's existing
 * singleton (`DashboardApiClient`) is fed in here.
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
