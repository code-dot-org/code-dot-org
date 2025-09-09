import {cookies, draftMode} from 'next/headers';
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

  // Allow draft mode to use SameSite=none in development
  if (process.env.NODE_ENV === 'development') {
    // Get the cookie store
    const cookieStore = await cookies();

    // Get the draft mode cookie that was just set
    const draftCookie = cookieStore.get('__prerender_bypass');

    // If we have the cookie, update it with cross-origin iframe support for Contentful's Experience Builder
    // See: https://github.com/vercel/next.js/issues/49927
    if (draftCookie?.value) {
      cookieStore.set({
        name: '__prerender_bypass',
        value: draftCookie.value,
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'none', // Allow cookie in cross-origin iframes
      });
    }
  }

  redirect(
    `/${locale}/${slug}?expEditorMode=${!!searchParams.get('expEditorMode')}`,
  );
}
