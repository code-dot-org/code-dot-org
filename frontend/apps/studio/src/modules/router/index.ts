/**
 * This module instantiates and configures TanStack Router
 *
 * See https://tanstack.com/router for more information.
 */
import {createRouter} from '@tanstack/react-router';

// Import the generated route tree
import {routeTree} from '@/routeTree.gen';

// Create a new router instance
// Note: The `/app` basepath is set to allow for subdirectory deployment in the rails_vite gem
// During the experimental phase, the vite app is solely served under the /app path
// This may change in the future
const router = createRouter({routeTree, basepath: '/app'});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default router;
