import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

const CertificatePrintBatchPage = lazy(() =>
  import('@code-dot-org/certificates').then(module => ({
    default: module.CertificatePrintBatchPage,
  })),
);

export const Route = createFileRoute('/print_certificates/batch')({
  component: RouteComponent,
});

function RouteComponent() {
  // The page reads the Rails-hydrated #vite-root data-certificate attribute.
  return (
    <Suspense fallback={<div>Loading certificate batch...</div>}>
      <CertificatePrintBatchPage />
    </Suspense>
  );
}
