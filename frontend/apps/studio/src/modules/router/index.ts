/**
 * This module instantiates and configures TanStack Router.
 *
 * See https://tanstack.com/router for more information.
 */
import {createRouter} from '@tanstack/react-router';

import {routeTree} from '@/routeTree.gen';

/**
 * The Vite SPA is served under `/frontend-studio/` in both modes:
 *
 *   - Rails: a catch-all route in `dashboard/config/routes.rb` maps
 *     `frontend-studio(/*path)` to `FrontendStudioController#index`, which renders the
 *     Haml shell that boots this router.
 *   - Standalone Vite: `config/vite.json`'s `publicOutputDir` is
 *     `frontend-studio`, so `vite-plugin-ruby` sets Vite's `base` to
 *     `/frontend-studio/` and the dev server only serves under that prefix.
 *
 * Route files in `src/routes/` declare canonical paths (e.g. `/projects/...`).
 * The basepath below tells the router to strip `/frontend-studio` from the
 * URL when matching and to prepend it when constructing links.
 */
const router = createRouter({routeTree, basepath: '/frontend-studio'});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default router;
