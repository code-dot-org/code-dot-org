import {
  getTestRecommendations,
  getSimilarRecommendations,
} from '@cdo/apps/util/curriculumRecommender/curriculumRecommender';
import {
  IS_FEATURED_TEST_COURSES,
  DURATION_TEST_COURSES,
  MARKETING_INIT_TEST_COURSES,
  SCHOOL_SUBJECT_TEST_COURSES,
  TOPICS_TEST_COURSES,
  PUBLISHED_DATE_TEST_COURSES,
  SIMILAR_RECOMMENDER_TEST_COURSES,
} from './curriculumRecommenderTestCurricula';
import {IMPORTANT_TOPICS} from '@cdo/apps/util/curriculumRecommender/curriculumRecommenderConstants';
import {expect} from '../../util/reconfiguredChai';

describe('testRecommender', () => {
  it('curricula marked as is_featured sorted before other curricula with same score', () => {
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

  it('adds score to curricula with desired duration', () => {
    const recommendedCurricula = getTestRecommendations(
      DURATION_TEST_COURSES,
      'week',
      '',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with desired duration score higher
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

    expect(recommendedCurricula).to.deep.equal([
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

    expect(recommendedCurricula).to.deep.equal([
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

    expect(recommendedCurricula).to.deep.equal([
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

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with multiple desired topics score higher
      'multipleTopicsCourse',
      // Curricula with one desired topic score higher
      'oneTopicCourse',
      // Curricula with undesired important topics score higher
      'undesiredImportantTopicCourse',
      'desiredImportantTopicCourse',
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

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with desired topic score higher
      'desiredImportantTopicCourse',
      // Curricula with undesired important topics score higher
      'undesiredImportantTopicCourse',
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

    expect(recommendedCurricula).to.deep.equal([
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
  it('similar curriculum recommender scores test curricula with relevant fields', () => {
    const recommendedCurricula = getSimilarRecommendations(
      SIMILAR_RECOMMENDER_TEST_COURSES,
      'month',
      'markInit1',
      'subject1',
      'topic1,topic2'
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      'multipleTopicsCourse', // 4 points = 2 * hasDesiredTopics(2)
      'multipleSchoolSubjectsCourse',
      'oneSchoolSubjectCourse',
      'publishedWithinTwoYearsAgoCourse',
      'oneTopicCourse',
      'marketingInitCourse1',
      'monthDurationCourse',
      'publishedWithinOneYearAgoCourse',
      'undesiredImportantTopicCourse',
      'desiredImportantTopicCourse',
      'featuredCourse',
      'emptyCourse',
      'nullCourse',
      'marketingInitCourse2',
      'weekDurationCourse',
    ]);
  });
});
