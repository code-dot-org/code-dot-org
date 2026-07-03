import {http, HttpResponse} from 'msw';

import {getActiveFixture} from './registry';

export const sectionsHandlers = [
  // GET /api/v1/sections — the caller's instructed sections.
  http.get('*/api/v1/sections', () => {
    return HttpResponse.json(getActiveFixture()?.sections ?? []);
  }),
];
