import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

const CertificatePrintPage = lazy(() =>
  import('@code-dot-org/certificates').then(module => ({
    default: module.CertificatePrintPage,
  })),
);

export const Route = createFileRoute('/print_certificates/$encodedParams')({
  component: RouteComponent,
});

function RouteComponent() {
  const {encodedParams} = Route.useParams();

  return (
    <Suspense fallback={<div>Loading certificate...</div>}>
      <CertificatePrintPage encodedParams={encodedParams} />
    </Suspense>
  );
}
