import {http, HttpResponse} from 'msw';

const mockSections = [
  {
    id: 11,
    location: '/v2/sections/11',
    name: 'My DEMO Section',
    courseVersionName: 'csd-2017',
    course_display_name: 'CS Discoveries 2017',
    login_type: 'picture',
    participant_type: 'student',
    grades: ['6', '7'],
    code: 'PMTKVH',
    lesson_extras: false,
    tts_autoplay_enabled: false,
    pairing_allowed: true,
    sharing_disabled: false,
    course_offering_id: 2,
    course_version_id: 3,
    course_id: null,
    script: {id: null, name: null},
    unitName: null,
    unitPosition: null,
    unit_id: null,
    createdAt: '2024-08-15T10:30:00.000Z',
    studentCount: 28,
    hidden: false,
    restrict_section: false,
    post_milestone_disabled: false,
    is_assigned_single_unit_course: false,
    is_assigned_csa: false,
    any_student_has_progress: true,
    sectionInstructors: [
      {
        id: 1,
        status: 'accepted',
        instructor_name: 'Demo Teacher',
        instructor_email: 'demo@code.org',
      },
    ],
    primaryInstructor: {
      name: 'Demo Teacher',
      email: 'demo@code.org',
      ltiRosterSyncEnabled: false,
    },
    sync_enabled: false,
    ai_tutor_enabled: false,
    avatar_color: 0,
    avatar_emoji: 0,
  },
  {
    id: 12,
    location: '/v2/sections/12',
    name: 'My Other Section',
    courseVersionName: 'coursea-2017',
    course_display_name: 'Course A',
    login_type: 'picture',
    participant_type: 'student',
    grades: ['2'],
    code: 'DWGMFX',
    lesson_extras: false,
    tts_autoplay_enabled: false,
    pairing_allowed: true,
    sharing_disabled: false,
    course_offering_id: 1,
    course_version_id: 1,
    course_id: null,
    course: {
      lesson_extras_available: true,
      text_to_speech_enabled: false,
      course_offering_id: 1,
      unit_id: 12,
      version_id: 2017,
    },
    unitName: 'coursea-2017',
    unitPosition: 1,
    unit_id: 12,
    script: {id: 12, name: 'coursea-2017'},
    createdAt: '2024-09-01T14:00:00.000Z',
    studentCount: 15,
    hidden: false,
    restrict_section: false,
    post_milestone_disabled: false,
    is_assigned_single_unit_course: false,
    is_assigned_csa: false,
    any_student_has_progress: false,
    sectionInstructors: [
      {
        id: 2,
        status: 'accepted',
        instructor_name: 'Demo Teacher',
        instructor_email: 'demo@code.org',
      },
    ],
    primaryInstructor: {
      name: 'Demo Teacher',
      email: 'demo@code.org',
      ltiRosterSyncEnabled: false,
    },
    sync_enabled: false,
    ai_tutor_enabled: false,
    avatar_color: 1,
    avatar_emoji: 1,
  },
];

export const handlers = [
  http.get('/dashboardapi/sections', () => {
    return HttpResponse.json(mockSections);
  }),

  http.get('/dashboardapi/sections/valid_course_offerings', () => {
    return HttpResponse.json({});
  }),

  http.get('/dashboardapi/sections/available_participant_types', () => {
    return HttpResponse.json({availableParticipantTypes: ['student']});
  }),
];
