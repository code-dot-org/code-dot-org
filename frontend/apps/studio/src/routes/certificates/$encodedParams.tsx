import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

const CertificateSharePage = lazy(() =>
  import('@code-dot-org/certificates').then(module => ({
    default: module.CertificateSharePage,
  })),
);

interface ShareSearch {
  i?: string;
}

function validateSearch(search: Record<string, unknown>): ShareSearch {
  return {
    i: typeof search.i === 'string' ? search.i : undefined,
  };
}

export const Route = createFileRoute('/certificates/$encodedParams')({
  validateSearch,
  component: RouteComponent,
});

function RouteComponent() {
  const {encodedParams} = Route.useParams();
  const {i} = Route.useSearch();

  return (
    <Suspense fallback={<div>Loading certificate...</div>}>
      <CertificateSharePage encodedParams={encodedParams} sessionId={i} />
    </Suspense>
  );
}
