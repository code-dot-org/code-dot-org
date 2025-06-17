import {cookies, draftMode} from 'next/headers';

export async function enableDraftMode() {
  console.log('enabling draft mode');
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
}
