import type {
  CertificateCongratsResponse,
  CertificateCourseInfo,
} from '@/certificate/model/certificateTypes';

import type {CertificateScenario} from './router';

export const defaultEncodedParams =
  'eyJuYW1lIjoiQWRhIiwiY291cnNlIjoib2NlYW5zIiwiZG9ub3IiOiJDb2RlLm9yZyJ9';

export const utf8EncodedParams =
  'eyJuYW1lIjoiWm_DqyDmnY4g8J-miiIsImNvdXJzZSI6Im9jZWFucyIsImRvbm9yIjoiQ29kZS5vcmcifQ';

export const batchDefaultNames = ['Alice', 'Bob', 'Charlie'];
export const batchUtf8Names = ['Amina 🌍', 'Zoë 李 🦊', 'أمينة 🚀', 'Марія'];

export const routeScenarios: CertificateScenario[] = [
  {
    id: 'share-oceans-default',
    kind: 'share',
    notes: 'ASCII share route.',
    url: `/certificates/${defaultEncodedParams}`,
  },
  {
    id: 'share-oceans-utf8',
    kind: 'share',
    notes: 'UTF-8 and emoji share route.',
    url: `/certificates/${utf8EncodedParams}`,
  },
  {
    id: 'share-blank',
    kind: 'blank',
    notes: 'Blank share route.',
    url: '/certificates/blank',
  },
  {
    id: 'batch-default',
    kind: 'batch',
    notes: 'Batch editor (Rails-hydrated in production; seeded here).',
    url: '/certificates/batch',
  },
  {
    id: 'print-oceans-default',
    kind: 'print',
    notes: 'ASCII print route.',
    url: `/print_certificates/${defaultEncodedParams}`,
  },
  {
    id: 'print-oceans-utf8',
    kind: 'print',
    notes: 'UTF-8 and emoji print route parity case.',
    url: `/print_certificates/${utf8EncodedParams}`,
  },
  {
    id: 'print-batch-default',
    kind: 'print-batch',
    notes: 'Batch print route seeded with default names.',
    url: '/print_certificates/batch',
  },
  {
    id: 'congrats-default',
    kind: 'congrats',
    notes: 'Congrats page with HOC defaults.',
    url: '/congrats?s=b2NlYW5z&i=session-123',
  },
];

export const courseInfoFixtures: Record<string, CertificateCourseInfo> = {
  'coursea-2025': {
    courseType: 'other',
    localizedTitle: 'Course A',
    prefilledTitle: false,
    templateFilename: 'blank_certificate.png',
    unitGroupTitle: null,
  },
  hourofcode: {
    courseType: 'hoc',
    localizedTitle: 'Hour of Code',
    prefilledTitle: true,
    templateFilename: 'hour_of_ai_certificate.png',
    unitGroupTitle: null,
  },
  oceans: {
    courseType: 'hoc',
    localizedTitle: 'AI for Oceans',
    prefilledTitle: true,
    templateFilename: 'oceans_hoc_certificate.png',
    unitGroupTitle: null,
  },
  'self-paced-pl': {
    courseType: 'pl',
    durationHours: 2.5,
    localizedTitle: 'Self-Paced Professional Learning',
    prefilledTitle: false,
    templateFilename: 'self_paced_pl_certificate.png',
    unitGroupTitle: 'Professional Learning',
  },
};

export const congratsFixture: CertificateCongratsResponse = {
  assignableCourseSuggestions: [],
  certificates: [
    {
      courseName: 'oceans',
      coursePath: '/s/oceans',
      courseTitle: 'AI for Oceans',
    },
  ],
  csrfToken: 'test-csrf-token',
  isHocTutorial: true,
  isK5PlCourse: false,
  isPlCourse: false,
  nextCourseDescription: null,
  nextCourseScriptName: null,
  nextCourseTitle: null,
  sections: [],
  under13: false,
  userName: 'Amina 🌍',
  userType: 'teacher',
};
