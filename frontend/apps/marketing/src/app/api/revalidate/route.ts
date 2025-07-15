import {revalidatePath, revalidateTag} from 'next/cache';

import logger from '@/logger/revalidate';

interface PagePaths {
  [locale: string]: string;
}

function revalidatePaths(pagePaths: PagePaths | undefined) {
  if (!pagePaths) {
    logger.debug('No pages to revalidate');
    return;
  }

  const pathsToRevalidate = Object.entries(pagePaths).reduce(
    (accumulator, [locale, slug]) => {
      accumulator.push(`/${locale}${slug}`);

      return accumulator;
    },
    Array<string>(),
  );

  logger.info(`Revalidating paths:`, {pathsToRevalidate});

  for (const path of pathsToRevalidate) {
    // Trigger ISR for the given page
    revalidatePath(path);
  }
}

function revalidateEntryTag(entryId: string | undefined) {
  if (!entryId) {
    console.debug('No entry ID provided for revalidation');
    return;
  }

  logger.info(`Revalidating entry ID: ${entryId}`, {entryId});

  revalidateTag(entryId);
}

function revalidateByContentType(contentType: string) {
  logger.info('Revalidating all tags for content type', {contentType});

  switch (contentType) {
    case 'redirect': {
      revalidateTag('redirect');
      break;
    }
  }
}

export async function POST(request: Request) {
  const {pagePaths, entryId, secret, contentType} = await request.json();

  if (secret !== process.env.CONTENTFUL_REVALIDATE_TOKEN) {
    return Response.json(
      {
        revalidated: false,
        message: 'Forbidden',
      },
      {status: 403},
    );
  }

  try {
    revalidatePaths(pagePaths);
    revalidateEntryTag(entryId);
    revalidateByContentType(contentType);
    return Response.json({revalidated: true});
  } catch (err) {
    console.error(err);
    return Response.json(
      {
        revalidated: false,
        message: 'Internal Error',
      },
      {status: 500},
    );
  }
}
