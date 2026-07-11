import type {CertificateCompletion} from '@/api/completion';
import type {CertificateCourse} from '@/api/courses';

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

export const courseInfoFixtures: Record<string, CertificateCourse> = {
  'coursea-2025': {
    courseKind: 'other',
    localizedTitle: 'Course A',
    prefilledTitle: false,
    resolution: 'matched',
    templateFilename: 'blank_certificate.png',
    unitGroupTitle: null,
  },
  hourofcode: {
    courseKind: 'hoc',
    localizedTitle: 'Hour of Code',
    prefilledTitle: true,
    resolution: 'hour_of_code_fallback',
    templateFilename: 'hour_of_ai_certificate.png',
    unitGroupTitle: null,
  },
  oceans: {
    courseKind: 'hoc',
    localizedTitle: 'AI for Oceans',
    prefilledTitle: true,
    resolution: 'matched',
    templateFilename: 'oceans_hoc_certificate.png',
    unitGroupTitle: null,
  },
  'self-paced-pl': {
    courseKind: 'pl',
    durationHours: 2.5,
    localizedTitle: 'Self-Paced Professional Learning',
    prefilledTitle: false,
    resolution: 'matched',
    templateFilename: 'self_paced_pl_certificate.png',
    unitGroupTitle: 'Professional Learning',
  },
};

export const completionFixture: CertificateCompletion = {
  certificates: [
    {
      courseName: 'oceans',
      coursePath: '/s/oceans',
    },
  ],
  courseKind: 'hour_of_code',
  recommendations: [],
};
