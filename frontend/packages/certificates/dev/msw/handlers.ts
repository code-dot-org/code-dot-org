import {http, HttpResponse} from 'msw';

import {completionFixture, courseInfoFixtures} from '../scenarios';

// Patterns start with `*/` because the core ky transport prefixes an absolute
// dashboard origin (e.g. http://localhost-studio.code.org:3000).
export const handlers = [
  http.get('*/get_token', () =>
    HttpResponse.json(null, {headers: {'csrf-token': 'test-csrf-token'}}),
  ),
  http.get('*/api/v1/certificates/courses/:course', ({params}) => {
    const course = String(params.course);
    const fixture = courseInfoFixtures[course] ?? courseInfoFixtures.hourofcode;

    return HttpResponse.json(fixture);
  }),
  http.get('*/api/v1/certificates/completion', () => {
    return HttpResponse.json(completionFixture);
  }),
  http.get('*/api/v1/certificates/viewer', () => {
    return HttpResponse.json({
      allowedShareTargets: ['facebook', 'x', 'linkedin'],
      canBulkPrint: true,
      certificateName: 'Amina 🌍',
    });
  }),
  http.patch('*/api/hour/certificates/:sessionId', async ({request}) => {
    const body = (await request.json()) as {name?: string} | null;

    return HttpResponse.json({
      certificate_sent: true,
      name: body?.name ?? null,
    });
  }),
];
