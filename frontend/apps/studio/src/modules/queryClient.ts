import {createQueryClient} from '@code-dot-org/core/api';

// One shared QueryClient, primed in the root route's beforeLoad, so feature
// modules read the current user from the same cache instead of re-fetching.
export const queryClient = createQueryClient();
