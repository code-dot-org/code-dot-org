import {
  IMPORTANT_TOPICS,
  UTC_PUBLISHED_DATE_FORMAT,
} from '@cdo/apps/util/curriculumRecommender/curriculumRecommenderConstants';
import moment from 'moment';

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

const SIMILAR_RECOMMENDER_TEST_COURSES = [
  ...NULL_AND_EMPTY_COURSES,
  ONLY_FEATURED_COURSE,
  ...ONLY_DURATION_COURSES,
  ...ONLY_MARKETING_INIT_COURSES,
  ...ONLY_SCHOOL_SUBJECTS_COURSES,
  ...ONLY_TOPICS_COURSES,
  ...ONLY_RECENT_PUBLISHED_DATE_COURSES,
];

export default {
  IS_FEATURED_TEST_COURSES,
  DURATION_TEST_COURSES,
  MARKETING_INIT_TEST_COURSES,
  SCHOOL_SUBJECT_TEST_COURSES,
  TOPICS_TEST_COURSES,
  PUBLISHED_DATE_TEST_COURSES,
  SIMILAR_RECOMMENDER_TEST_COURSES,
};
