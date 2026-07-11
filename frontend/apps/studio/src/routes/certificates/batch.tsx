import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

const CertificateBatchPage = lazy(() =>
  import('@code-dot-org/certificates').then(module => ({
    default: module.CertificateBatchPage,
  })),
);

export const Route = createFileRoute('/certificates/batch')({
  component: RouteComponent,
  validateSearch: search => ({
    // `course` is the legacy base64-encoded course name.
    courseName:
      typeof search.course === 'string'
        ? decodeCourseName(search.course)
        : undefined,
  }),
});

function RouteComponent() {
  const {courseName} = Route.useSearch();

  return (
    <Suspense fallback={null}>
      <CertificateBatchPage courseName={courseName} />
    </Suspense>
  );
}

function decodeCourseName(value: string): string {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    const bytes = Uint8Array.from(atob(padded), character =>
      character.charCodeAt(0),
    );
    return new TextDecoder('utf-8', {fatal: true}).decode(bytes);
  } catch {
    return '';
  }
}
