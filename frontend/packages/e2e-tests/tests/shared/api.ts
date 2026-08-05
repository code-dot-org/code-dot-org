import {type Page} from '@playwright/test';

/** Result of an in-browser API request: HTTP ok flag, status, and raw body text. */
export interface CsrfResponse {
  ok: boolean;
  status: number;
  body: string;
}

/**
 * Issue a same-origin request from the page context, attaching the CSRF token
 * from the current document's <meta> tag and JSON-encoding `body` when given.
 * The page must already be on the target host so the token and session cookie
 * are present. The token reflects the session the document was last loaded
 * under, so reload after a sign-in before hitting an authenticated endpoint.
 *
 * This is the shared transport primitive for every e2e API helper, not just
 * auth: keep API-specific wrappers in their own modules and route them here.
 */
export async function requestWithCsrf(
  page: Page,
  method: string,
  path: string,
  body?: unknown,
): Promise<CsrfResponse> {
  return page.evaluate(
    async ({method, path, body}) => {
      const csrfToken =
        document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute('content') ?? '';
      const headers: Record<string, string> = {'X-CSRF-Token': csrfToken};
      const init: RequestInit = {method, headers};
      if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(body);
      }
      const resp = await fetch(path, init);
      return {ok: resp.ok, status: resp.status, body: await resp.text()};
    },
    {method, path, body},
  );
}
