import {Button} from '@mui/material';
import {createFileRoute, redirect} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

import {signInRedirectHref} from '@/modules/auth';
import {ErrorPage} from '@/modules/errors';

// Lazy so the accounts package lands in its own chunk, fetched on first nav.
const AccountSettingsPage = lazy(() => import('@code-dot-org/accounts'));

interface AccountsSearch {
  tab?: string;
}

export const Route = createFileRoute('/users/edit')({
  validateSearch: (search: Record<string, unknown>): AccountsSearch => ({
    tab: typeof search.tab === 'string' ? search.tab : undefined,
  }),
  beforeLoad: ({context}) => {
    // Return-to from our own browser path, never from query params.
    const returnTo = window.location.pathname + window.location.search;
    const href = signInRedirectHref(context.auth, returnTo);
    if (href) {
      // reloadDocument: hard-nav to Rails sign-in. A client redirect would
      // prefix the SPA basepath and 404 in the router.
      throw redirect({href, reloadDocument: true});
    }
  },
  component: AccountsRoute,
  errorComponent: AccountsError,
});

function AccountsRoute() {
  const {tab} = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    // null fallback: the root layout reserves the content height (no footer
    // jump) and the page renders its own loading status once the chunk loads.
    <Suspense fallback={null}>
      <AccountSettingsPage
        tab={tab}
        onTabChange={next => navigate({search: {tab: next}, replace: true})}
      />
    </Suspense>
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
