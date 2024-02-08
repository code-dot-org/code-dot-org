import {getTestRecommendations} from '@cdo/apps/util/curriculumRecommender/curriculumRecommender';
import {FAKE_SINGLE_TRAIT_CURRICULA} from '@cdo/apps/util/curriculumRecommender/curriculumRecommenderConstants';
import {expect} from '../../util/reconfiguredChai';

describe('testRecommender', () => {
  it('adds score to curricula with any school subjects or any important cs topics', () => {
    const recommendedCurricula = getTestRecommendations(
      FAKE_SINGLE_TRAIT_CURRICULA,
      '',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with any school subjects score higher
      'onlyMultipleSchoolSubjectsCourse',
      'onlyOneSchoolSubjectCourse',
      // Curricula with any important topics score higher
      'onlyImportantCsTopicCourse',
      // Sort remaining 0 scores by is_featured and published_date
      'onlyFeaturedCourse',
      'onlyMultipleCsTopicsCourse',
      'onlyOneCsTopicCourse',
      'onlyMarketingInitiativeCourse',
      'onlyDurationCourse',
      'nullCourse',
    ]);
  });

  it('adds score to curricula with specified school subjects', () => {
    const recommendedCurricula = getTestRecommendations(
      FAKE_SINGLE_TRAIT_CURRICULA,
      '',
      '',
      'fakeSubject1,fakeSubject2'
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with multiple specified school subjects score higher for each overlapping school subject
      'onlyMultipleSchoolSubjectsCourse',
      // Curricula with one specified school subject score higher
      'onlyOneSchoolSubjectCourse',
      // Curricula with any important topics score higher
      'onlyImportantCsTopicCourse',
      // Sort remaining 0 scores by is_featured and published_date
      'onlyFeaturedCourse',
      'onlyMultipleCsTopicsCourse',
      'onlyOneCsTopicCourse',
      'onlyMarketingInitiativeCourse',
      'onlyDurationCourse',
      'nullCourse',
    ]);
  });

  it('adds score to curricula with specified duration', () => {
    const recommendedCurricula = getTestRecommendations(
      FAKE_SINGLE_TRAIT_CURRICULA,
      'month',
      '',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with the specified duration score higher
      'onlyDurationCourse',
      // Curricula with any school subjects or any important topics score higher
      'onlyImportantCsTopicCourse',
      'onlyMultipleSchoolSubjectsCourse',
      'onlyOneSchoolSubjectCourse',
      // Sort remaining 0 scores by is_featured and published_date
      'onlyFeaturedCourse',
      'onlyMultipleCsTopicsCourse',
      'onlyOneCsTopicCourse',
      'onlyMarketingInitiativeCourse',
      'nullCourse',
    ]);
  });

  it('adds score to curricula with specified marketing initiative', () => {
    const recommendedCurricula = getTestRecommendations(
      FAKE_SINGLE_TRAIT_CURRICULA,
      '',
      'fakeMarkInit',
      ''
    ).map(curr => curr.key);

    expect(recommendedCurricula).to.deep.equal([
      // Curricula with the specified marketing initiative score higher
      'onlyMarketingInitiativeCourse',
      // Curricula with any school subjects or any important topics score higher
      'onlyImportantCsTopicCourse',
      'onlyMultipleSchoolSubjectsCourse',
      'onlyOneSchoolSubjectCourse',
      // Sort remaining 0 scores by is_featured and published_date
      'onlyFeaturedCourse',
      'onlyMultipleCsTopicsCourse',
      'onlyOneCsTopicCourse',
      'onlyDurationCourse',
      'nullCourse',
    ]);
  });
});
