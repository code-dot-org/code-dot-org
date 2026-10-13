import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';

import App from '@/App';

const rootRoute = createRootRoute({component: Outlet});
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
});

const router = createRouter({routeTree: rootRoute.addChildren([homeRoute])});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default router;
