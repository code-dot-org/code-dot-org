import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

const CertificateCongratsPage = lazy(() =>
  import('@code-dot-org/certificates').then(module => ({
    default: module.CertificateCongratsPage,
  })),
);

interface CongratsSearch {
  i?: string;
  s?: string;
}

function validateSearch(search: Record<string, unknown>): CongratsSearch {
  return {
    i: typeof search.i === 'string' ? search.i : undefined,
    s: typeof search.s === 'string' ? search.s : undefined,
  };
}

export const Route = createFileRoute('/congrats')({
  validateSearch,
  component: RouteComponent,
});

function RouteComponent() {
  const {i, s} = Route.useSearch();

  return (
    <Suspense fallback={<div>Loading certificates...</div>}>
      <CertificateCongratsPage encodedCourse={s} sessionId={i} />
    </Suspense>
  );
}
