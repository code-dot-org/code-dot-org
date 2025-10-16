'use client'; // Error boundaries must be Client Components

import {useEffect, useState} from 'react';
import {v4 as uuid} from 'uuid';

import {handleError} from '@/otel/errorHandler';

/**
 * This error boundary is for cases where the more specific error boundaries have all failed.
 * In this case, it is possible that an error occurred in the component library, middleware, or other core features.
 * Therefore, we cannot paint an error page based on those components (as they may be the cause of the error), and
 * instead must rely on plain HTML.
 */
export default function ErrorPage(props: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  const [traceId, setTraceId] = useState<string>();

  useEffect(() => {
    const currentTraceId = uuid();
    setTraceId(currentTraceId);

    handleError(props.error, currentTraceId);
  }, [props.error]);

  return (
    <html lang="en">
      <body>
        <h1>This page isn't working</h1>
        <p>
          Uh oh! We ran into an internal server error and couldn't complete your
          request.
        </p>

        <span style={{display: 'flex', gap: 10}}>
          <button onClick={() => props.reset()}>Try again</button>
          <a href="https://status.code.org">
            <button>Check status page</button>
          </a>
        </span>

        <p>Error Trace ID: {traceId}</p>

        <pre>{props.error?.stack}</pre>
      </body>
    </html>
  );
}
