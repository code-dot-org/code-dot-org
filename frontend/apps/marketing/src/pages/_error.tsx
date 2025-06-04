'use client'; // Error boundaries must be Client Components

import Honeybadger from '@honeybadger-io/js';
import {NextPageContext} from 'next';
import {v4 as uuid} from 'uuid';

import Error from '@/components/error';

function ErrorPage({
  error,
}: {
  error: Error & {digest?: string};
  statusCode: number;
}) {
  const errorTraceId = uuid();
  if (typeof window === 'undefined') {
    Honeybadger.notify(error);
  }

  return (
    <>
      <Error statusCode={500} error={error} errorTraceId={errorTraceId} />
    </>
  );
}

ErrorPage.getInitialProps = ({err}: NextPageContext) => {
  return {error: err};
};

export default ErrorPage;
