import {http, HttpResponse} from 'msw';

export const preferencesHandlers = [
  // GET /user_preference/theme — default empty theme. A lab fixture's `theme`
  // is served ahead of this by the generic dispatcher (see
  // `registerLabFixtures`, which wraps it in the `{theme: {...}}` shape
  // UserThemeSettingsSchema expects); this is the fall-through default.
  http.get('*/user_preference/theme', () => {
    return HttpResponse.json({theme: {}});
  }),
];
