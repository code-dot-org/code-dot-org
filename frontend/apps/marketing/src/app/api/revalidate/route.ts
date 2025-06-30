import {revalidatePath, revalidateTag} from 'next/cache';

interface PagePaths {
  [locale: string]: string;
}

function revalidatePaths(pagePaths: PagePaths | undefined) {
  if (!pagePaths) {
    console.debug('No pages to revalidate');
    return;
  }

  const pathsToRevalidate = Object.entries(pagePaths).reduce(
    (accumulator, [locale, slug]) => {
      accumulator.push(`/${locale}${slug}`);

      return accumulator;
    },
    Array<string>(),
  );

  console.log(`Revalidating paths:`, pathsToRevalidate);

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

  console.log(`Revalidating tag for entry ID: ${entryId}`);

  revalidateTag(entryId);
}

export async function POST(request: Request) {
  const {pagePaths, entryId, secret} = await request.json();

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
