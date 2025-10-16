'use client';
import {sendGAEvent} from '@next/third-parties/google';
import {usePathname} from 'next/navigation';
import {useEffect} from 'react';

import Error from '@/components/error';

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    sendGAEvent('event', 'page_not_found', {
      path: pathname,
    });
  }, [pathname]);

  return (
    <>
      {/*
        No support for metadata in not-found.tsx yet
        See: https://github.com/vercel/next.js/issues/45620
      */}
      <title>Page Not Found</title>
      <Error statusCode={404} />
    </>
  );
}
