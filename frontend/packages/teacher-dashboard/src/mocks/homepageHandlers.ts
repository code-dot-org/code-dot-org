// Default MSW handlers shared by all personas. Persona-specific handlers
// override these via the core fixture registry (first match wins).

import type {MockRoute} from '@code-dot-org/core/api/mocks';

// Sample contentful promotions returned by default when the endpoint is not overridden.
const SAMPLE_PROMOTIONS = [
  {
    id: 'promo-new-curriculum',
    announcement_type: 'New Curriculum',
    background_color: 'Gray',
    title: 'Introducing AI Foundations',
    description:
      'A new curriculum designed to teach students the fundamentals of artificial intelligence, machine learning, and ethical AI practices.',
    button_label: 'Explore the curriculum',
    button_target: '/catalog',
    image: null,
    is_closable: true,
    partner_logo: null,
    is_external: false,
  },
  {
    id: 'promo-hoc-2025',
    announcement_type: 'Hour of Code',
    background_color: 'Gray',
    title: 'Hour of Code 2025',
    description:
      'Sign up your class for the Hour of Code! New activities featuring AI and data science are available now.',
    button_label: 'Get started',
    button_target: 'https://hourofcode.com',
    image: null,
    is_closable: true,
    partner_logo: null,
    is_external: true,
  },
];

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
  // Contentful marketing promotions.
  {
    method: 'get',
    path: '*/marketing/teacher/promotions/*',
    respond: SAMPLE_PROMOTIONS,
  },
  // Suggested lesson for section cards.
  {
    method: 'get',
    path: '*/api/v1/sections/:sectionId/suggested_lesson',
    respond: {
      lesson_id: 3,
      timestamp: new Date().toISOString(),
      name: 'Lesson 3: Exploring Technology',
      url: '/s/csd3-2024/lessons/3/levels/1',
      completed_unit: false,
    },
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
  // NPS survey configuration.
  {
    method: 'get',
    path: '*/form/nps_survey/configuration',
    respond: {props: ''},
  },
  // Dismiss donor teacher banner.
  {
    method: 'post',
    path: '*/dashboardapi/v1/users/me/dismiss_donor_teacher_banner',
    respond: () => new Response(null, {status: 204}),
  },
  // Section archive/restore toggle.
  {
    method: 'post',
    path: '*/dashboardapi/sections/:id/toggle_hidden',
    respond: {success: true},
  },
  // Demo section creation.
  {
    method: 'post',
    path: '*/api/v1/sections/demo',
    respond: {id: 999, name: 'Practice Class', demo_type: 'elementary'},
  },
  // Demo section reset.
  {
    method: 'post',
    path: '*/api/v1/sections/demo/reset',
    respond: {success: true},
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
