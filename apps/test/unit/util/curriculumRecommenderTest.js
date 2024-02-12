import {getTestRecommendations} from '@cdo/apps/util/curriculumRecommender/curriculumRecommender';
import {IMPORTANT_TOPICS} from '@cdo/apps/util/curriculumRecommender/curriculumRecommenderConstants';
import {expect} from '../../util/reconfiguredChai';

// "nullCourse" and "emptyCourse" have more recent publish dates than the fake courses with a single trait so that
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
    key: 'importantTopicCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: IMPORTANT_TOPICS[0],
    school_subject: null,
    published_date: '2015-05-03 05:00:00 UTC',
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

describe('testRecommender', () => {
  it('curricula marked as is_featured sorted before other curricula with same score ', () => {
    const recommendedCurricula = getTestRecommendations(
      IS_FEATURED_TEST_COURSES,
      '',
      '',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula marked as is_featured sorted before other 0-scoring curricula
      'featuredCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
    ]);
  });

  it('adds score to curricula with specified duration', () => {
    const recommendedCurricula = getTestRecommendations(
      DURATION_TEST_COURSES,
      'week',
      '',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with specified duration score higher
      'weekDurationCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
      'monthDurationCourse',
    ]);
  });

  it('adds score to curricula with specified marketing initiative', () => {
    const recommendedCurricula = getTestRecommendations(
      MARKETING_INIT_TEST_COURSES,
      '',
      'markInit1',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with specified marketing initiative score higher
      'marketingInitCourse1',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
      'marketingInitCourse2',
    ]);
  });

  it('adds score to curricula with any school subjects', () => {
    const recommendedCurricula = getTestRecommendations(
      SCHOOL_SUBJECT_TEST_COURSES,
      '',
      '',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with any school subjects score higher
      'multipleSchoolSubjectsCourse',
      'oneSchoolSubjectCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
    ]);
  });

  it('adds score to curricula with specified school subjects', () => {
    const recommendedCurricula = getTestRecommendations(
      SCHOOL_SUBJECT_TEST_COURSES,
      '',
      '',
      'subject1,subject2',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with multiple specified school subjects score higher
      'multipleSchoolSubjectsCourse',
      // Curricula with one specified school subject score higher
      'oneSchoolSubjectCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
    ]);
  });

  it('adds score to curricula with any important topics', () => {
    const recommendedCurricula = getTestRecommendations(
      TOPICS_TEST_COURSES,
      '',
      '',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with any important topics score higher
      'importantTopicCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
      'multipleTopicsCourse',
      'oneTopicCourse',
    ]);
  });

  it('adds score to curricula with specified topics', () => {
    const recommendedCurricula = getTestRecommendations(
      TOPICS_TEST_COURSES,
      '',
      '',
      '',
      'topic1,topic2'
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with multiple specified topics score higher
      'multipleTopicsCourse',
      // Curricula with one specified topic score higher
      'oneTopicCourse',
      // Curricula with any important topics score higher
      'importantTopicCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
    ]);
  });
});
