import {getTestRecommendations} from '@cdo/apps/util/curriculumRecommender/curriculumRecommender';
import {IMPORTANT_TOPICS} from '@cdo/apps/util/curriculumRecommender/curriculumRecommenderConstants';
import {expect} from '../../util/reconfiguredChai';

const NULL_AND_EMPTY_COURSES = [
  {
    key: 'nullCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2015-01-01 05:00:00 UTC',
  },
  {
    key: 'emptyCourse',
    is_featured: false,
    duration: '',
    marketing_initiative: '',
    grade_levels: '',
    cs_topic: '',
    school_subject: '',
    published_date: '2015-02-01 05:00:00 UTC',
  },
];

const JUST_DURATION_COURSES = [
  {
    key: 'weekDurationCourse',
    is_featured: false,
    duration: 'week',
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2015-03-01 05:00:00 UTC',
  },
  {
    key: 'monthDurationCourse',
    is_featured: false,
    duration: 'month',
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2015-04-01 05:00:00 UTC',
  },
];

const JUST_MARKETING_INIT_COURSES = [
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
    published_date: '2015-04-01 05:00:00 UTC',
  },
];

const DURATION_TEST_COURSES = [
  ...NULL_AND_EMPTY_COURSES,
  ...JUST_DURATION_COURSES,
];

const MARKETING_INIT_TEST_COURSES = [
  ...NULL_AND_EMPTY_COURSES,
  ...JUST_MARKETING_INIT_COURSES,
];

// const FAKE_SINGLE_TRAIT_CURRICULA = [
//   {
//     key: 'onlyFeaturedCourse',
//     is_featured: true,
//     duration: null,
//     marketing_initiative: null,
//     grade_levels: null,
//     cs_topic: null,
//     school_subject: null,
//     published_date: '2015-02-01 05:00:00 UTC',
//   },
  
//   {
//     key: 'onlyMarketingInitiativeCourse',
//     is_featured: false,
//     duration: null,
//     marketing_initiative: 'fakeMarkInit',
//     grade_levels: null,
//     cs_topic: null,
//     school_subject: null,
//     published_date: '2015-04-01 05:00:00 UTC',
//   },
//   {
//     key: 'onlyOneCsTopicCourse',
//     is_featured: false,
//     duration: null,
//     marketing_initiative: null,
//     grade_levels: null,
//     cs_topic: 'fakeTopic',
//     school_subject: null,
//     published_date: '2015-05-01 05:00:00 UTC',
//   },
//   {
//     key: 'onlyImportantCsTopicCourse',
//     is_featured: false,
//     duration: null,
//     marketing_initiative: null,
//     grade_levels: null,
//     cs_topic: IMPORTANT_TOPICS[0],
//     school_subject: null,
//     published_date: '2015-06-01 05:00:00 UTC',
//   },
//   {
//     key: 'onlyMultipleCsTopicsCourse',
//     is_featured: false,
//     duration: null,
//     marketing_initiative: null,
//     grade_levels: null,
//     cs_topic: `fakeTopic,${IMPORTANT_TOPICS[0]}`,
//     school_subject: null,
//     published_date: '2015-07-01 05:00:00 UTC',
//   },
//   {
//     key: 'onlyOneSchoolSubjectCourse',
//     is_featured: false,
//     duration: null,
//     marketing_initiative: null,
//     grade_levels: null,
//     cs_topic: null,
//     school_subject: 'fakeSubject1',
//     published_date: '2015-08-01 05:00:00 UTC',
//   },
//   {
//     key: 'onlyMultipleSchoolSubjectsCourse',
//     is_featured: false,
//     duration: null,
//     marketing_initiative: null,
//     grade_levels: null,
//     cs_topic: null,
//     school_subject: 'fakeSubject1,fakeSubject2',
//     published_date: '2015-09-01 05:00:00 UTC',
//   },
// ];

// const FAKE_FULL_CURRICULA = [
//   {
//     key: 'fullCourse',
//     is_featured: true,
//     duration: 'month',
//     marketing_initiative: 'fakeMarkInit',
//     grade_levels: '2,3,4,5,6',
//     cs_topic: 'fakeTopic,fakeImportantTopic',
//     school_subject: 'fakeSubject1,fakeSubject2',
//     published_date: '2015-08-01 05:00:00 UTC',
//   },
// ];

describe('testRecommender', () => {
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
      'monthDurationCourse',
      'emptyCourse',
      'nullCourse',
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
      'marketingInitCourse2',
      'emptyCourse',
      'nullCourse',
    ]);
  });

  // it('adds score to curricula with specified school subjects', () => {
  //   const recommendedCurricula = getTestRecommendations(
  //     FAKE_SINGLE_TRAIT_CURRICULA,
  //     '',
  //     '',
  //     'fakeSubject1,fakeSubject2',
  //     ''
  //   ).map(curr => curr.key);

  //   expect(recommendedCurricula).to.deep.equal([
  //     // Curricula with multiple specified school subjects score higher for each overlapping school subject
  //     'onlyMultipleSchoolSubjectsCourse',
  //     // Curricula with one specified school subject score higher
  //     'onlyOneSchoolSubjectCourse',
  //     // Curricula with any important topics score higher
  //     'onlyMultipleCsTopicsCourse',
  //     'onlyImportantCsTopicCourse',
  //     // Sort remaining 0 scores by is_featured and published_date
  //     'onlyFeaturedCourse',
  //     'onlyOneCsTopicCourse',
  //     'onlyMarketingInitiativeCourse',
  //     'onlyDurationCourse',
  //     'nullCourse',
  //   ]);
  // });

  // it('adds score to curricula with specified duration', () => {
  //   const recommendedCurricula = getTestRecommendations(
  //     FAKE_SINGLE_TRAIT_CURRICULA,
  //     'month',
  //     '',
  //     '',
  //     ''
  //   ).map(curr => curr.key);

  //   expect(recommendedCurricula).to.deep.equal([
  //     // Curricula with the specified duration score higher
  //     'onlyDurationCourse',
  //     // Curricula with any school subjects or any important topics score higher
  //     'onlyMultipleSchoolSubjectsCourse',
  //     'onlyOneSchoolSubjectCourse',
  //     'onlyMultipleCsTopicsCourse',
  //     'onlyImportantCsTopicCourse',
  //     // Sort remaining 0 scores by is_featured and published_date
  //     'onlyFeaturedCourse',
  //     'onlyOneCsTopicCourse',
  //     'onlyMarketingInitiativeCourse',
  //     'nullCourse',
  //   ]);
  // });

  // it('adds score to curricula with specified marketing initiative', () => {
  //   const recommendedCurricula = getTestRecommendations(
  //     FAKE_SINGLE_TRAIT_CURRICULA,
  //     '',
  //     'fakeMarkInit',
  //     '',
  //     ''
  //   ).map(curr => curr.key);

  //   expect(recommendedCurricula).to.deep.equal([
  //     // Curricula with the specified marketing initiative score higher
  //     'onlyMarketingInitiativeCourse',
  //     // Curricula with any school subjects or any important topics score higher
  //     'onlyMultipleSchoolSubjectsCourse',
  //     'onlyOneSchoolSubjectCourse',
  //     'onlyMultipleCsTopicsCourse',
  //     'onlyImportantCsTopicCourse',
  //     // Sort remaining 0 scores by is_featured and published_date
  //     'onlyFeaturedCourse',
  //     'onlyOneCsTopicCourse',
  //     'onlyDurationCourse',
  //     'nullCourse',
  //   ]);
  // });

  // it('adds score to curricula with specified cs topics', () => {
  //   const recommendedCurricula = getTestRecommendations(
  //     FAKE_SINGLE_TRAIT_CURRICULA,
  //     '',
  //     '',
  //     '',
  //     'fakeTopic'
  //   ).map(curr => curr.key);

  //   expect(recommendedCurricula).to.deep.equal([
  //     // Curricula with the specified cs topics initiative score higher
  //     'onlyMultipleCsTopicsCourse',
  //     'onlyOneCsTopicCourse',
  //     // Curricula with any school subjects or any important topics score higher
  //     'onlyMultipleSchoolSubjectsCourse',
  //     'onlyOneSchoolSubjectCourse',
  //     'onlyImportantCsTopicCourse',
  //     // Sort remaining 0 scores by is_featured and published_date
  //     'onlyFeaturedCourse',
  //     'onlyMarketingInitiativeCourse',
  //     'onlyDurationCourse',
  //     'nullCourse',
  //   ]);
  // });
});
