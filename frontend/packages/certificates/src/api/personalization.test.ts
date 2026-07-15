import {http, HttpResponse} from 'msw';
import {afterEach, expect, it} from 'vitest';

import {setSpaCsrfToken} from '@code-dot-org/core/api';

import {server} from '../../dev/msw/server';

import {personalizeHocCertificate} from './personalization';

afterEach(() => setSpaCsrfToken(null));

it('fetches a missing CSRF token before personalizing', async () => {
  let csrfHeader: string | null = null;
  server.use(
    http.get('*/get_token', () =>
      HttpResponse.json({}, {headers: {'csrf-token': 'fresh-csrf-token'}}),
    ),
    http.patch('*/api/hour/certificates/:sessionId', async ({request}) => {
      csrfHeader = request.headers.get('X-CSRF-Token');
      const body = (await request.json()) as {name: string};
      return HttpResponse.json({certificate_sent: true, name: body.name});
    }),
  );

  const response = await personalizeHocCertificate('session-123', 'Ada');

  expect(csrfHeader).toBe('fresh-csrf-token');
  expect(response).toEqual({certificate_sent: true, name: 'Ada'});
});
