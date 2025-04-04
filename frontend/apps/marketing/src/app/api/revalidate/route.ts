import {revalidatePath} from 'next/cache';

export async function POST(request: Request) {
  const {path, secret} = await request.json();

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
    revalidatePath(path); // Trigger ISR for the given page
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
