/**
 * This module instantiates and configures TanStack Router
 *
 * See https://tanstack.com/router for more information.
 */
import {createRouter} from '@tanstack/react-router';

// Import the generated route tree
import {routeTree} from '@/routeTree.gen';

// Create a new router instance.
//
// Basepath combines Vite's public base (`import.meta.env.BASE_URL`, set from
// `config/vite.json` `publicOutputDir` via vite-plugin-rails) with the
// `/app` mount used by Rails for the subdirectory deployment.
//
// - In standalone dev: Vite serves under `/frontend-studio/`, so the SPA
//   sits at `/frontend-studio/app/...`.
// - In Rails-served prod: Rails routes `/app/*` to the SPA shell; assets
//   are emitted under the public output dir. The router still strips the
//   combined prefix uniformly.
// Vite's BASE_URL is `/frontend-studio/` for Rails-served builds, or `./`
// for Capacitor builds (see vite.config.ts CAPACITOR_BUILD branch). Only
// the absolute form contributes to the router basepath; for the relative
// form the SPA is mounted at the WebView's `/` and just needs `/app`.
const RAW_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const BASE_PREFIX = RAW_BASE.startsWith('/') ? RAW_BASE : '';
const router = createRouter({routeTree, basepath: `${BASE_PREFIX}/app`});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default router;
