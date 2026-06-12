import {createQueryClient} from '@code-dot-org/core/api';

// One shared QueryClient for the app: primed in the root route's `beforeLoad`
// and provided to the tree, so feature modules (e.g. accounts) read the current
// user from the same cache instead of re-fetching it (design D4).
export const queryClient = createQueryClient();
