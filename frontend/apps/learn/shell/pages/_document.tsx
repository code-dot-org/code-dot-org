import {
  revalidate,
  FlushedChunks,
  flushChunks,
  type FlushedChunksProps,
} from '@module-federation/nextjs-mf/utils';
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentProps,
} from 'next/document';
import { VercelToolbar } from '@vercel/toolbar/next';

export default function MyDocument(props: DocumentProps & FlushedChunksProps) {
  return (
    <Html lang="en">
      <Head>
        <FlushedChunks chunks={props.chunks} />
      </Head>
      <body className="flex min-h-screen flex-col">
        <Main />
        <NextScript />
        <VercelToolbar />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  if (
    process.env.NODE_ENV === 'development' &&
    !ctx.req?.url?.includes('_next')
  ) {
    await revalidate().then((shouldReload) => {
      if (shouldReload) {
        ctx.res?.writeHead(302, {
          Location: ctx.req?.url,
        });
        ctx.res?.end();
      }
    });
  } else {
    ctx.res?.on('finish', () => {
      revalidate().catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error revalidating:', err);
      });
    });
  }

  const initialProps = await Document.getInitialProps(ctx);
  const chunks = await flushChunks();

  return { ...initialProps, chunks };
};
