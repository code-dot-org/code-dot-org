/**
 * GET /api/v1/sections → 200 array — two sections for TD-HOME-SECTION-LIST:
 * one unassigned with 0 students, one assigned to
 * `ui-test-single-unit-course-2026` unit 1 with 1 joined student. Shaped to
 * satisfy `SectionListSummarySchema` (wire shape — snake_case/camelCase mix
 * as returned by `summarize_without_students`).
 */
export const listSections: Record<string, unknown>[] = [
  {
    id: 101,
    name: 'Period 1',
    code: 'ABCDEF',
    login_type: 'email',
    hidden: false,
    grades: ['3'],
    participant_type: 'student',
    studentCount: 0,
    course_display_name: null,
    courseVersionName: null,
    unit_id: null,
    unitPosition: null,
    avatar_color: 0,
    avatar_emoji: 0,
    demo_type: null,
  },
  {
    id: 102,
    name: 'Period 2',
    code: 'GHIJKL',
    login_type: 'email',
    hidden: false,
    grades: ['4'],
    participant_type: 'student',
    studentCount: 1,
    course_display_name: 'Single-Unit Course 2026',
    courseVersionName: 'ui-test-single-unit-course-2026',
    unit_id: 1,
    unitPosition: 1,
    avatar_color: 1,
    avatar_emoji: 1,
    demo_type: null,
  },
];
