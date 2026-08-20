/**
 * This module instantiates and configures TanStack Router.
 *
 * See https://tanstack.com/router for more information.
 */
import {createRouter} from '@tanstack/react-router';

import {routeTree} from '@/routeTree.gen';

/**
 * The Vite assets are served under `/frontend-studio/` in both modes:
 *
 *   - Rails: a catch-all route in `dashboard/config/routes.rb` maps
 *     `frontend-studio(/*path)` to `FrontendStudioController#index`, which renders the
 *     Haml shell that boots this router.
 *   - Standalone Vite: `config/vite.json`'s `publicOutputDir` is
 *     `frontend-studio`, so `vite-plugin-ruby` sets Vite's `base` to
 *     `/frontend-studio/` and the dev server only serves under that prefix.
 *
 * Route files in `src/routes/` declare public paths (e.g. `/projects/...`).
 * Build Lab is entered through `/projects/build-lab/...` in the Dashboard;
 * `/frontend-studio/...` remains available for the standalone host. Choose the
 * matching basepath at runtime so both entry points construct valid links.
 */
const routerBasepath = window.location.pathname.startsWith('/frontend-studio')
  ? '/frontend-studio'
  : '';
const router = createRouter({routeTree, basepath: routerBasepath});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default router;
