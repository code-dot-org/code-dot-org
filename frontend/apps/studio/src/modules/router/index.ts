/**
 * This module instantiates and configures TanStack Router.
 *
 * See https://tanstack.com/router for more information.
 */
import {createRouter} from '@tanstack/react-router';

import {routeTree} from '@/routeTree.gen';

// Rails uses /frontend-studio/; the relative PWA build runs at the origin root.
const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  // Per-route static metadata read by the root shell. `hideFooter` lets a
  // route opt out of the global `StudioFooter` (e.g. a full-bleed lab route);
  // the shell reads it from the matched routes via `useMatches`.
  interface StaticDataRouteOption {
    hideFooter?: boolean;
  }
}

export default router;
