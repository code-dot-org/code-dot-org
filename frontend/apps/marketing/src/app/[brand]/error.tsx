'use client'; // Error boundaries must be Client Components

import Error from '@/components/error';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  return <Error statusCode={500} error={error} resetAction={reset} />;
}
