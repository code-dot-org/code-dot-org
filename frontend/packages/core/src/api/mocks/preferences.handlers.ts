import {http, HttpResponse} from 'msw';

import {getActiveFixture} from './registry';

export const preferencesHandlers = [
  // GET /user_preference/theme — UserThemeSettingsSchema expects `{theme: {...}}`.
  // The fixture's `theme` is just the inner record; we wrap it here.
  http.get('*/user_preference/theme', () => {
    const theme = getActiveFixture()?.theme ?? {};
    return HttpResponse.json({theme});
  }),
];
