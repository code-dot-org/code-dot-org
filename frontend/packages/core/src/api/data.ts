// Data-only API surface — schemas, types, constants, query keys,
// transport factories, React contexts. Safe to import from node-only
// environments (validation scripts, build tools, server tests, etc.):
// no module-load side effects that touch `window` or read
// `import.meta.env`.
//
// The runtime barrel (`./index.ts`) re-exports everything here plus
// `bootstrapApiClient` and the `DashboardApiClient` singleton — both
// of which transitively read site config at module load.

export * from './dashboard';
export * from './client';
export * from './contexts';
export {default as QueryClientProvider} from './QueryClientProvider';
export * from './transports';

export {ZodError as ValidationError} from 'zod';

import type {QueryClient} from '@tanstack/react-query';
export type {QueryClient};

import {useQueryClient} from '@tanstack/react-query';
export {useQueryClient};
