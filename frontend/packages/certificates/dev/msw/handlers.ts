import {http, HttpResponse} from 'msw';

import {congratsFixture, courseInfoFixtures} from '../scenarios';

// Patterns start with `*/` because the core ky transport prefixes an absolute
// dashboard origin (e.g. http://localhost-studio.code.org:3000).
export const handlers = [
  http.get('*/api/v1/certificates/course_info/:locale/:course', ({params}) => {
    const course = String(params.course);
    const fixture = courseInfoFixtures[course] ?? courseInfoFixtures.hourofcode;

    return HttpResponse.json(fixture);
  }),
  http.get('*/api/v1/certificates/congrats', () => {
    return HttpResponse.json(congratsFixture);
  }),
  http.get('*/api/v1/certificates/user_info', () => {
    const {under13, userName, userType} = congratsFixture;
    return HttpResponse.json({
      csrfToken: 'test-csrf-token',
      under13,
      userName,
      userType,
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
