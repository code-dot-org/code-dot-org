/**
 * Fetch cookies signed by cloudfront which grant access to restricted content.
 */
export async function fetchSignedCookies(
  buster: boolean = false,
): Promise<Response> {
  return fetch(
    `/dashboardapi/sign_cookies${buster ? `?bust=${Date.now()}` : ''}`,
    {
      credentials: 'same-origin',
    },
  );
}
