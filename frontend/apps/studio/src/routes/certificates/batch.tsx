import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

const CertificateBatchPage = lazy(() =>
  import('@code-dot-org/certificates').then(module => ({
    default: module.CertificateBatchPage,
  })),
);

export const Route = createFileRoute('/certificates/batch')({
  component: RouteComponent,
});

function RouteComponent() {
  // The page reads the Rails-hydrated #vite-root data-certificate attribute.
  return (
    <Suspense fallback={<div>Loading certificate batch...</div>}>
      <CertificateBatchPage />
    </Suspense>
  );
}
