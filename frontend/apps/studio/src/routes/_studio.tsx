import {Box} from '@mui/material';
import {
  createFileRoute,
  Outlet,
  useMatches,
  useRouter,
} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import {useCallback} from 'react';

import StudioFooter from '@/components/footer';
import SiteHeader from '@/components/header';
import {
  fetchAuthOutcome,
  primeCsrfToken,
  primeCurrentUser,
  useAuth,
} from '@/modules/auth';
import {AuthErrorPage} from '@/modules/errors';
import {queryClient} from '@/modules/queryClient';

import {shouldHideFooter} from './shouldHideFooter';

export const Route = createFileRoute('/_studio')({
  beforeLoad: async () => {
    const auth = await fetchAuthOutcome();
    primeCurrentUser(queryClient, auth);
    await primeCsrfToken();
    return {auth};
  },
  component: StudioLayout,
});

function StudioLayout() {
  const auth = useAuth();
  const router = useRouter();
  const onRetry = useCallback(() => router.invalidate(), [router]);
  const hideFooter = shouldHideFooter(useMatches());

  return (
    <>
      <SiteHeader />
      <Box sx={{minHeight: 'calc(100vh - 50px)'}}>
        {auth.status === 'error' ? (
          <AuthErrorPage
            onRetry={onRetry}
            observabilityEventId={auth.observabilityEventId}
          />
        ) : (
          <Outlet />
        )}
      </Box>
      {!hideFooter && <StudioFooter />}
      <TanStackRouterDevtools />
    </>
  );
}
