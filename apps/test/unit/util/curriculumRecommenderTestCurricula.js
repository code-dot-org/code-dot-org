import moment from 'moment';

import {
  IMPORTANT_TOPICS,
  UTC_PUBLISHED_DATE_FORMAT,
} from '@cdo/apps/util/curriculumRecommender/curriculumRecommenderConstants';

// "nullCourse" and "emptyCourse" have more recent publish dates than the test courses with a single trait so that
// it'll be clear which courses received points and which didn't. After sorting by points, the recommended curricula
// are sorted by if they are featured and by published_date. So, any 0-scoring non-featured curricula will be listed
// after "nullCourse" and "emptyCourse".
const NULL_AND_EMPTY_COURSES = [
  {
    key: 'nullCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2020-01-01 05:00:00 UTC',
  },
  {
    key: 'emptyCourse',
    is_featured: false,
    duration: '',
    marketing_initiative: '',
    grade_levels: '',
    cs_topic: '',
    school_subject: '',
    published_date: '2020-02-01 05:00:00 UTC',
  },
];

const ONLY_FEATURED_COURSE = {
  key: 'featuredCourse',
  is_featured: true,
  duration: null,
  marketing_initiative: null,
  grade_levels: null,
  cs_topic: null,
  school_subject: null,
  published_date: '2015-01-01 05:00:00 UTC',
};

const ONLY_DURATION_COURSES = [
  {
    key: 'weekDurationCourse',
    is_featured: false,
    duration: 'week',
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2015-02-01 05:00:00 UTC',
  },
  {
    key: 'monthDurationCourse',
    is_featured: false,
    duration: 'month',
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2015-02-02 05:00:00 UTC',
  },
];

const ONLY_MARKETING_INIT_COURSES = [
  {
    key: 'marketingInitCourse1',
    is_featured: false,
    duration: null,
    marketing_initiative: 'markInit1',
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2015-03-01 05:00:00 UTC',
  },
  {
    key: 'marketingInitCourse2',
    is_featured: false,
    duration: null,
    marketing_initiative: 'markInit2',
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2015-03-02 05:00:00 UTC',
  },
];

const ONLY_SCHOOL_SUBJECTS_COURSES = [
  {
    key: 'oneSchoolSubjectCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: 'subject1',
    published_date: '2015-04-01 05:00:00 UTC',
  },
  {
    key: 'multipleSchoolSubjectsCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: 'subject1,subject2',
    published_date: '2015-04-02 05:00:00 UTC',
  },
];

const ONLY_TOPICS_COURSES = [
  {
    key: 'oneTopicCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: 'topic1',
    school_subject: null,
    published_date: '2015-05-01 05:00:00 UTC',
  },
  {
    key: 'multipleTopicsCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: 'topic1,topic2',
    school_subject: null,
    published_date: '2015-05-02 05:00:00 UTC',
  },
  {
    key: 'firstImportantTopicCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: IMPORTANT_TOPICS[0],
    school_subject: null,
    published_date: '2015-05-03 05:00:00 UTC',
  },
  {
    key: 'secondImportantTopicCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: IMPORTANT_TOPICS[1],
    school_subject: null,
    published_date: '2015-05-04 05:00:00 UTC',
  },
];

const ONLY_RECENT_PUBLISHED_DATE_COURSES = [
  {
    key: 'publishedWithinOneYearAgoCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: moment()
      .utc()
      .subtract(6, 'months')
      .format(UTC_PUBLISHED_DATE_FORMAT),
  },
  {
    key: 'publishedWithinTwoYearsAgoCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: moment
      .utc()
      .subtract(18, 'months')
      .format(UTC_PUBLISHED_DATE_FORMAT),
  },
];

const IS_FEATURED_TEST_COURSES = [
  ...NULL_AND_EMPTY_COURSES,
  ONLY_FEATURED_COURSE,
];

const DURATION_TEST_COURSES = [
  ...NULL_AND_EMPTY_COURSES,
  ...ONLY_DURATION_COURSES,
];

const MARKETING_INIT_TEST_COURSES = [
  ...NULL_AND_EMPTY_COURSES,
  ...ONLY_MARKETING_INIT_COURSES,
];

const SCHOOL_SUBJECT_TEST_COURSES = [
  ...NULL_AND_EMPTY_COURSES,
  ...ONLY_SCHOOL_SUBJECTS_COURSES,
];

const TOPICS_TEST_COURSES = [...NULL_AND_EMPTY_COURSES, ...ONLY_TOPICS_COURSES];

// This set of courses includes the featured course so that there is a clear division between which courses
// are scoring points for how recently they were published and which are just being sorted higher because
// of their recent publish date.
const PUBLISHED_DATE_TEST_COURSES = [
  ...IS_FEATURED_TEST_COURSES,
  ...ONLY_RECENT_PUBLISHED_DATE_COURSES,
];

const FULL_TEST_COURSES = [
  {
    key: 'fullTestCourse1',
    course_offering_id: 1,
    display_name: 'Full Test Course 1',
    display_name_with_latest_year: 'Full Test Course 1 (6 months ago)',
    description: 'Full Test Course 1 description',
    is_featured: true,
    duration: 'week',
    marketing_initiative: 'markInit1',
    grade_levels: '1,2,3',
    cs_topic: `art_and_design,${IMPORTANT_TOPICS[0]}`,
    school_subject: 'math',
    published_date: moment
      .utc()
      .subtract(7, 'months')
      .format(UTC_PUBLISHED_DATE_FORMAT),
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"ideal","no_device":"ideal"}',
    course_version_path: '/fullTestCourse1-path',
  },
  {
    key: 'fullTestCourse2',
    course_offering_id: 2,
    display_name: 'Full Test Course 2',
    display_name_with_latest_year: 'Full Test Course 2 (1 year ago)',
    description: 'Full Test Course 2 description',
    is_featured: false,
    duration: 'month',
    marketing_initiative: 'markInit1',
    grade_levels: '1,2,3',
    cs_topic: 'art_and_design,app_design',
    school_subject: 'math',
    published_date: moment
      .utc()
      .subtract(13, 'months')
      .format(UTC_PUBLISHED_DATE_FORMAT),
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"ideal","no_device":"ideal"}',
    course_version_path: '/fullTestCourse2-path',
  },
  {
    key: 'fullTestCourse3',
    course_offering_id: 3,
    display_name: 'Full Test Course 3',
    display_name_with_latest_year: 'Full Test Course 3 (1.5 years ago)',
    description: 'Full Test Course 3 description',
    is_featured: false,
    duration: 'month',
    marketing_initiative: 'markInit2',
    grade_levels: '3,4,5',
    cs_topic: `${IMPORTANT_TOPICS[0]}`,
    school_subject: 'math',
    published_date: moment
      .utc()
      .subtract(19, 'months')
      .format(UTC_PUBLISHED_DATE_FORMAT),
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"ideal","no_device":"ideal"}',
    course_version_path: '/fullTestCourse3-path',
  },
  {
    key: 'fullTestCourse4',
    course_offering_id: 4,
    display_name: 'Full Test Course 4',
    display_name_with_latest_year: 'Full Test Course 4 (2 years ago)',
    description: 'Full Test Course 4 description',
    is_featured: false,
    duration: 'month',
    marketing_initiative: 'markInit2',
    grade_levels: '3,4,5,6',
    cs_topic: 'app_design',
    school_subject: 'science',
    published_date: moment
      .utc()
      .subtract(25, 'months')
      .format(UTC_PUBLISHED_DATE_FORMAT),
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"ideal","no_device":"ideal"}',
    course_version_path: '/fullTestCourse4-path',
  },
  {
    key: 'fullTestCourse5',
    course_offering_id: 5,
    display_name: 'Full Test Course 5',
    display_name_with_latest_year: 'Full Test Course 5 (2.5 years ago)',
    description: 'Full Test Course 5 description',
    is_featured: true,
    duration: 'month',
    marketing_initiative: 'markInit2',
    grade_levels: '4,5,6',
    cs_topic: 'app_design',
    school_subject: 'science',
    published_date: moment
      .utc()
      .subtract(31, 'months')
      .format(UTC_PUBLISHED_DATE_FORMAT),
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"ideal","no_device":"ideal"}',
    course_version_path: '/fullTestCourse5-path',
  },
  {
    key: 'fullTestCourse6',
    course_offering_id: 6,
    display_name: 'Full Test Course 6',
    display_name_with_latest_year: 'Full Test Course 6 (3 years ago)',
    description: 'Full Test Course 6 description',
    is_featured: true,
    duration: 'quarter',
    marketing_initiative: 'markInit2',
    grade_levels: '3,4,5,6,7',
    cs_topic: 'app_design',
    school_subject: null,
    published_date: moment
      .utc()
      .subtract(37, 'months')
      .format(UTC_PUBLISHED_DATE_FORMAT),
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"ideal","no_device":"ideal"}',
    course_version_path: '/fullTestCourse6-path',
  },
];

export default {
  IS_FEATURED_TEST_COURSES,
  DURATION_TEST_COURSES,
  MARKETING_INIT_TEST_COURSES,
  SCHOOL_SUBJECT_TEST_COURSES,
  TOPICS_TEST_COURSES,
  PUBLISHED_DATE_TEST_COURSES,
  FULL_TEST_COURSES,
};
