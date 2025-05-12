import {draftMode} from 'next/headers';

export async function POST() {
  const draft = await draftMode();

  draft.disable();

  return new Response('Draft mode disabled', {status: 200});
}
