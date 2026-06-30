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
