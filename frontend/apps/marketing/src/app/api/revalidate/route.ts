import {revalidatePath} from 'next/cache';

export async function POST(request: Request) {
  const {pagePaths, secret} = await request.json();

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
