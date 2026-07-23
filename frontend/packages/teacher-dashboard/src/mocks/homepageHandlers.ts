// Default MSW handlers shared by all personas. Persona-specific handlers
// override these via the core fixture registry (first match wins).

import type {MockRoute} from '@code-dot-org/core/api/mocks';

// Stable defaults that apply across all personas unless overridden.
export const homepageHandlers: MockRoute[] = [
  {
    method: 'get',
    path: '*/teaching_profile_data',
    respond: {data: {matchedPersona: true}},
  },
  {
    method: 'get',
    path: '*/dashboardapi/v1/user_product_tours',
    respond: [],
  },
  {
    method: 'get',
    path: '*/teacher_dashboard/get_drawer_data',
    respond: {items: []},
  },
  {
    method: 'get',
    path: '*/api/v1/sections/assigned_essential_ai_dependency',
    respond: {has_assigned_essential_ai_dependency: false},
  },
  {
    method: 'get',
    path: '*/api/v1/sections/demo/presets',
    respond: {},
  },
  {
    method: 'post',
    path: '*/sections/archive_all',
    respond: {success: true},
  },
  {
    method: 'delete',
    path: '*/dashboardapi/sections/:id',
    respond: {success: true},
  },
  {
    method: 'get',
    path: '*/api/v1/section_instructors',
    respond: [],
  },
  // Lesson dropdown — empty by default; per-persona handlers override this.
  {
    method: 'get',
    path: '*/sections/:sectionId/retrieve_lessons_for_dropdown',
    respond: [],
  },
  // User preferences used by the homepage (personalization alert, onboarding hidden).
  {
    method: 'get',
    path: '*/api/v1/users/me/preferences/*',
    respond: false,
  },
  {
    method: 'post',
    path: '*/api/v1/users/me/preferences/*',
    respond: () => new Response(null, {status: 204}),
  },
  // CSRF token refresh.
  {
    method: 'get',
    path: '*/get_token',
    respond: () =>
      new Response(null, {
        status: 200,
        headers: {'csrf-token': 'mock-csrf-token'},
      }),
  },
];
