import DashboardApiClient from './dashboard/SingletonDashboardApiClient';

export * from './dashboard';

export {DashboardApiClient};
export * from './client';
export * from './contexts';
export * from './bootstrapApiClient';
export {setSpaCsrfToken, getSpaCsrfToken, refreshCsrfToken} from './csrfToken';
export {default as QueryClientProvider} from './QueryClientProvider';
export {createQueryClient} from './createQueryClient';
export * from './transports';

export {ZodError as ValidationError} from 'zod';

import type {QueryClient} from '@tanstack/react-query';
export type {QueryClient};

import {useQueryClient} from '@tanstack/react-query';
export {useQueryClient};

// Re-exported so labs can wrap their host boundary without depending on
// @tanstack/react-query directly, and so they share this package's react-query
// context (a QueryErrorResetBoundary must sit under the same provider).
export {QueryErrorResetBoundary} from '@tanstack/react-query';
