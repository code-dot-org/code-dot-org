import {Box, Button, Typography} from '@mui/material';
import {createFileRoute, redirect} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

import {signInRedirectHref} from '@/modules/auth';
import {ErrorPage} from '@/modules/errors';

// Lazy so the accounts package lands in its own Vite chunk, fetched only on the
// first navigation to this route (design D5). The package's default export is
// the page component.
const AccountSettingsPage = lazy(() => import('@code-dot-org/accounts'));

interface AccountsSearch {
  tab?: string;
}

export const Route = createFileRoute('/users/edit')({
  // Tab is deep-linkable via ?tab= and owned by the router (design D11).
  validateSearch: (search: Record<string, unknown>): AccountsSearch => ({
    tab: typeof search.tab === 'string' ? search.tab : undefined,
  }),
  beforeLoad: ({context}) => {
    // Build the return-to from our own browser path, never from query params
    // (design D5 / studio-accounts-route auth gate).
    const returnTo = window.location.pathname + window.location.search;
    const href = signInRedirectHref(context.auth, returnTo);
    if (href) {
      throw redirect({href});
    }
  },
  component: AccountsRoute,
  errorComponent: AccountsError,
});

function AccountsRoute() {
  const {tab} = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <Suspense fallback={<AccountsSkeleton />}>
      <AccountSettingsPage
        tab={tab}
        onTabChange={next => navigate({search: {tab: next}, replace: true})}
      />
    </Suspense>
  );
}

// Minimal fallback for the lazy-chunk window. No height reserve here — the root
// layout holds the content area open so the footer never jumps (CLS).
function AccountsSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      sx={{
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
      }}
    >
      <Typography>Loading your account…</Typography>
    </Box>
  );
}

function AccountsError({reset}: {reset: () => void}) {
  return (
    <ErrorPage
      title="We couldn’t open your account settings."
      description="Something went wrong loading this page. Please try again."
      actions={
        <Button variant="contained" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
