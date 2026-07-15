import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

const CertificateSharePage = lazy(() =>
  import('@code-dot-org/certificates').then(module => ({
    default: module.CertificateSharePage,
  })),
);

export const Route = createFileRoute('/certificates/blank')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Suspense fallback={null}>
      <CertificateSharePage />
    </Suspense>
  );
}
