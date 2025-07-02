import {eTag} from '@tinyhttp/etag';
import {NextRequest} from 'next/server';

import {STALE_WHILE_REVALIDATE_ONE_HOUR} from '@/cache/constants';
import {getRedirectEntry} from '@/cache/redirects/getRedirectEntry';
import {Brand} from '@/config/brand';
import {getLocalhostDomain} from '@/config/host';

/**
 * API route to get a redirect entry by pathname and brand.
 * GET /api/private/redirects?pathname=[path]&brand=[brand]
 */

export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{brand: Brand; pathname: string}>},
) {
  const host = request.headers.get('host');
  const {brand, pathname} = await params;

  /**
   * Note this is a basic security measure to prevent crawlers from accessing this endpoint.
   * If somebody were to access this endpoint by manually inputting localhost as the Host, it would expose whether
   * a path is redirected or not, which can be inferred just by going to said path. (No additional info gained)
   *
   * Use of this API is intended for internal use via the middleware.
   */
  if (getLocalhostDomain() !== host) {
    return new Response(`Invalid host: ${host}`, {status: 403});
  }

  if (!pathname) {
    return new Response('Missing required parameter pathname', {status: 400});
  }

  if (!brand) {
    return new Response('Missing required parameter brand', {status: 400});
  }

  const redirectEntry = await getRedirectEntry(pathname, brand);

  if (redirectEntry) {
    const responseBody = JSON.stringify(redirectEntry);
    // This API uses Stale While Revalidate with an ETag for caching
    return new Response(responseBody, {
      headers: {
        'Cache-Control': STALE_WHILE_REVALIDATE_ONE_HOUR,
        ETag: eTag(responseBody),
      },
    });
  }

  return new Response('Not Found', {
    status: 404,
  });
}
