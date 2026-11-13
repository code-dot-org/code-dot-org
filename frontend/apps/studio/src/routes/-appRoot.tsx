// Only the fonts the Android app's pages draw, which it bundles to draw them
// offline. vite.mobile.config.ts makes this the mobile build's root route.
import '@code-dot-org/fonts/brands/CodeAIApp/index.css';

import {createStudioRootRoute} from '@/modules/router/rootRoute';

export const Route = createStudioRootRoute();
