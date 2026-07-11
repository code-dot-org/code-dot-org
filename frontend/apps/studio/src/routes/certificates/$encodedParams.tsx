import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

const CertificateSharePage = lazy(() =>
  import('@code-dot-org/certificates').then(module => ({
    default: module.CertificateSharePage,
  })),
);

interface ShareSearch {
  sessionId?: string;
}

function validateSearch(search: Record<string, unknown>): ShareSearch {
  return {
    // `i` is the legacy Hour of Code activity session ID.
    sessionId: typeof search.i === 'string' ? search.i : undefined,
  };
}

export const Route = createFileRoute('/certificates/$encodedParams')({
  validateSearch,
  component: RouteComponent,
});

function RouteComponent() {
  const {encodedParams} = Route.useParams();
  const {sessionId} = Route.useSearch();

  return (
    <Suspense fallback={null}>
      <CertificateSharePage
        encodedParams={encodedParams}
        sessionId={sessionId}
      />
    </Suspense>
  );
}
