import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

export const SUBMISSION_STATUSES = {
  UNSUBMITTED: 'unsubmitted',
  DUPLICATE: 'duplicate',
  OWN: 'own',
  CLOSED: 'closed',
  FULL: 'full',
  NOT_FOUND: 'not found',
  SUCCESS: 'success',
  UNKNOWN_ERROR: 'error',
};

export const OTHER = 'Other';
export const NOT_TEACHING = "I'm not teaching this year";
export const EXPLAIN = '(Please Explain):';

export const CSF = 'CS Fundamentals';
export const INTRO = SubjectNames.SUBJECT_CSF_101;
export const DISTRICT = SubjectNames.SUBJECT_CSF_DISTRICT;
export const DEEP_DIVE = SubjectNames.SUBJECT_CSF_201;

export const CSP = 'CS Principles';
export const ADMIN_COUNSELOR = 'Admin/Counselor Workshop';

export const DESCRIBE_ROLES = [
  'School Administrator',
  'District Administrator',
  'Parent',
  'Other',
];

export const CSF_ROLES = [
  '',
  'Classroom Teacher',
  'Media Specialist',
  'Tech Teacher',
  'Librarian',
].concat(DESCRIBE_ROLES);

export const ADMIN_COUNSELOR_ROLES = [
  '',
  'Administrator',
  'Counselor',
  'Other',
];

export const GRADES_TEACHING = [
  'Pre-K',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6-8',
  'Grade 9-12',
];

export const CSF_COURSES = {
  courseA: 'Course A',
  courseB: 'Course B',
  courseC: 'Course C',
  courseD: 'Course D',
  courseE: 'Course E',
  courseF: 'Course F',
  express: 'Express',
  courses14_accelerated: 'Courses 1-4 or Accelerated',
};

export const ATTENDED_CSF_COURSES_OPTIONS: Record<string, string> = {
  'Yes, I attended a CS Fundamentals Intro workshop this academic year.':
    'Yes, this year',
  'Yes, I attended a CS Fundamentals Intro workshop in a previous academic year.':
    'Yes, prior year',
  'Nope, I have never attended a CS Fundamentals workshop.': 'No',
};
