import {createFileRoute, notFound} from '@tanstack/react-router';
import {useEffect} from 'react';

import Offline from '@/components/launcher/Offline';
import {isMobileBuild} from '@/config/buildMode';

// MainActivity.kt handles this link and never loads it: it returns to the
// landing page.
const HOME_URL = 'https://studio.code.org/codeai-app/home';

// PageInjector.kt sends a page it could not fetch here, with that page as
// ?url=. Only studio.code.org pages are retried.
function retryUrl(url: unknown): string | undefined {
  return typeof url === 'string' && url.startsWith('https://studio.code.org/')
    ? url
    : undefined;
}

function OfflinePage() {
  const {url} = Route.useSearch();
  const target = url ?? HOME_URL;
  // Replaces this page in history, so Back skips it once the page loads.
  const tryAgain = () => window.location.replace(target);

  // MainActivity.kt reports the network to the WebView, which fires online
  // when the tablet reconnects.
  useEffect(() => {
    window.addEventListener('online', tryAgain);
    return () => window.removeEventListener('online', tryAgain);
  });

  return (
    <Offline
      onTryAgain={tryAgain}
      onBack={() => window.location.assign(HOME_URL)}
    />
  );
}

export const Route = createFileRoute('/offline')({
  head: () => ({meta: [{title: 'No internet connection'}]}),
  validateSearch: (search: Record<string, unknown>) => ({
    url: retryUrl(search.url),
  }),
  // Only the mobile build serves this page; the web shell answers not found.
  loader: () => {
    if (!isMobileBuild()) {
      throw notFound();
    }
  },
  component: OfflinePage,
});
