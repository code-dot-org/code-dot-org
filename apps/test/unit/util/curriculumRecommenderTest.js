import {
  getTestRecommendations,
  getSimilarRecommendations,
  getStretchRecommendations,
} from '@cdo/apps/util/curriculumRecommender/curriculumRecommender';
import {IMPORTANT_TOPICS} from '@cdo/apps/util/curriculumRecommender/curriculumRecommenderConstants';

import {
  IS_FEATURED_TEST_COURSES,
  DURATION_TEST_COURSES,
  MARKETING_INIT_TEST_COURSES,
  SCHOOL_SUBJECT_TEST_COURSES,
  TOPICS_TEST_COURSES,
  PUBLISHED_DATE_TEST_COURSES,
  FULL_TEST_COURSES,
} from './curriculumRecommenderTestCurricula';

describe('testRecommender', () => {
  it('curricula marked as is_featured sorted before other curricula with same score', () => {
    const recommendedCurricula = getTestRecommendations(
      IS_FEATURED_TEST_COURSES,
      '',
      '',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).toEqual([
      // Curricula marked as is_featured sorted before other 0-scoring curricula
      'featuredCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
    ]);
  });

  it('adds score to curricula with desired duration', () => {
    const recommendedCurricula = getTestRecommendations(
      DURATION_TEST_COURSES,
      'month',
      '',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).toEqual([
      // Curricula with desired duration score higher
      'monthDurationCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
      'weekDurationCourse',
    ]);
  });

  it('adds score to curricula with a slightly longer duration', () => {
    const recommendedCurricula = getTestRecommendations(
      DURATION_TEST_COURSES,
      'lesson',
      '',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).toEqual([
      // Curricula with slightly longer duration score higher
      'weekDurationCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
      'monthDurationCourse',
    ]);
  });

  it('adds score to curricula with desired marketing initiative', () => {
    const recommendedCurricula = getTestRecommendations(
      MARKETING_INIT_TEST_COURSES,
      '',
      'markInit1',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).toEqual([
      // Curricula with desired marketing initiative score higher
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

    expect(recommendedCurricula).toEqual([
      // Curricula with any school subjects score higher
      'multipleSchoolSubjectsCourse',
      'oneSchoolSubjectCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
    ]);
  });

  it('adds score to curricula with desired school subjects', () => {
    const recommendedCurricula = getTestRecommendations(
      SCHOOL_SUBJECT_TEST_COURSES,
      '',
      '',
      'subject1,subject2',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).toEqual([
      // Curricula with multiple desired school subjects score higher
      'multipleSchoolSubjectsCourse',
      // Curricula with one desired school subject score higher
      'oneSchoolSubjectCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
    ]);
  });

  it('adds score to curricula with desired topics', () => {
    const recommendedCurricula = getTestRecommendations(
      TOPICS_TEST_COURSES,
      '',
      '',
      '',
      'topic1,topic2'
    ).map(curr => curr.key);

    expect(recommendedCurricula).toEqual([
      // Curricula with multiple desired topics score higher
      'multipleTopicsCourse',
      // Curricula with one desired topic score higher
      'oneTopicCourse',
      // Curricula with undesired important topics score higher
      'secondImportantTopicCourse',
      'firstImportantTopicCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
    ]);
  });

  it('adds score to curricula with non-desired important topics', () => {
    const recommendedCurricula = getTestRecommendations(
      TOPICS_TEST_COURSES,
      '',
      '',
      '',
      IMPORTANT_TOPICS[0]
    ).map(curr => curr.key);

    expect(recommendedCurricula).toEqual([
      // Curricula with desired topic score higher
      'firstImportantTopicCourse',
      // Curricula with undesired important topics score higher
      'secondImportantTopicCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
      'multipleTopicsCourse',
      'oneTopicCourse',
    ]);
  });

  it('adds score to curricula published within the last 2 years', () => {
    const recommendedCurricula = getTestRecommendations(
      PUBLISHED_DATE_TEST_COURSES,
      '',
      '',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).toEqual([
      // Curricula published within the last year score higher
      'publishedWithinOneYearAgoCourse',
      // Curricula published within the last 2 years score higher
      'publishedWithinTwoYearsAgoCourse',
      // Curricula marked as is_featured are sorted higher (in this case, it's sorted first of the 0-scoring curricula)
      'featuredCourse',
      // Sort remaining 0-score curricula by published_date
      'emptyCourse',
      'nullCourse',
    ]);
  });
});

describe('similarRecommender', () => {
  it('similar curriculum recommender scores relevant test curricula', () => {
    const recommendedCurricula = getSimilarRecommendations(
      FULL_TEST_COURSES,
      'fullTestCourse1',
      null
    ).map(curr => curr.key);

    // Check recommended curricula results. fullTestCourse1 should be filtered out because it's the curriculum each other one is being compared against,
    // and fullTestCourse5 should be filtered out because it does not support any of the same grade levels as fullTestCourse1.
    expect(recommendedCurricula).toEqual([
      'fullTestCourse2' /* 7 points = hasDesiredMarketingInitiative(2) + (1 overlapping subject * overlappingDesiredSchoolSubject(2)) +
                          (1 overlapping topic * overlappingDesiredTopic(2)) + publishedWithinTwoYearsAgo(1) */,
      'fullTestCourse3' /* 5 points = (1 overlapping topic * overlappingDesiredTopic(2)) + (1 overlapping subject * overlappingDesiredSchoolSubject(2)) +
                          publishedWithinTwoYearsAgo(1) */,
      'fullTestCourse4' /* 1 point = hasAnySchoolSubject(2) */,
      'fullTestCourse6' /* 0 points */,
    ]);
  });
});

describe('stretchRecommender', () => {
  it('stretch curriculum recommender scores relevant test curricula', () => {
    const recommendedCurricula = getStretchRecommendations(
      FULL_TEST_COURSES,
      'fullTestCourse1',
      null
    ).map(curr => curr.key);

    // Check recommended curricula results. fullTestCourse1 should be filtered out because it's the curriculum each other one is being compared against,
    // and fullTestCourse5 should be filtered out because it does not support any of the same grade levels as fullTestCourse1.
    expect(recommendedCurricula).toEqual([
      'fullTestCourse3' /* 6 points = hasDesiredDuration(2) + hasDesiredMarketingInitiative(1) + hasImportantButNotDesiredTopic(2) +
                           publishedWithinTwoYearsAgo(1) */,
      'fullTestCourse4' /* 4 points = hasDesiredDuration(2) + hasDesiredMarketingInitiative(1) + overlappingDesiredSchoolSubject(1) */,
      'fullTestCourse6' /* 3 points = hasDesiredMarketingInitiative(1) + hasAnySchoolSubject(2) [sorted before fullTestCourse2 because fullTestCourse6
                           is marked as featured] */,
      'fullTestCourse2' /* 3 points = hasDesiredDuration(2) + publishedWithinTwoYearsAgo(1) */,
    ]);
  });
});
