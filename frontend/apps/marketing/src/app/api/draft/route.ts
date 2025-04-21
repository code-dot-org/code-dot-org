import {draftMode} from 'next/headers';
import {redirect} from 'next/navigation';

export async function GET(request: Request) {
  // Parse query string parameters
  const {searchParams} = new URL(request.url);
  const token = searchParams.get('token');
  const slug = searchParams.get('slug');
  const locale = searchParams.get('locale');

  // Check the secret and next parameters
  // This secret should only be known to this Route Handler and the CMS
  if (token !== process.env.DRAFT_MODE_TOKEN) {
    return new Response('Invalid token', {status: 401});
  }

  if (!slug || !locale) {
    return new Response('Invalid parameters supplied', {status: 400});
  }

  // Enable Draft Mode by setting the cookie
  const draft = await draftMode();
  draft.enable();

  redirect(
    `/${locale}/${slug}?expEditorMode=${!!searchParams.get('expEditorMode')}`,
  );
}
