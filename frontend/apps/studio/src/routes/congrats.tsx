import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

const CertificateCongratsPage = lazy(() =>
  import('@code-dot-org/certificates').then(module => ({
    default: module.CertificateCongratsPage,
  })),
);

interface CongratsSearch {
  encodedCourse?: string;
  sessionId?: string;
}

function validateSearch(search: Record<string, unknown>): CongratsSearch {
  return {
    // `s` is the legacy base64-encoded completed course name.
    encodedCourse: typeof search.s === 'string' ? search.s : undefined,
    // `i` is the legacy Hour of Code activity session ID.
    sessionId: typeof search.i === 'string' ? search.i : undefined,
  };
}

export const Route = createFileRoute('/congrats')({
  validateSearch,
  component: RouteComponent,
});

function RouteComponent() {
  const {encodedCourse, sessionId} = Route.useSearch();

  return (
    <Suspense fallback={null}>
      <CertificateCongratsPage
        encodedCourse={encodedCourse}
        sessionId={sessionId}
      />
    </Suspense>
  );
}
