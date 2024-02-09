// Topics we care about promoting more than others
export const IMPORTANT_TOPICS = [
  'artificial_intelligence',
  'physical_computing',
];

/*
 * TEST CONSTANTS
 */
export const FAKE_RECOMMENDER_SCORING = {
  hasAnySchoolSubject: 1,
  hasDesiredSchoolSubjects: 2,
  hasAnyImportantTopic: 1,
  hasDesiredTopics: 2,
  hasDesiredDuration: 3,
  hasDesiredMarketingInitiative: 4,
};

export const FAKE_SINGLE_TRAIT_CURRICULA = [
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
    key: 'onlyFeaturedCourse',
    is_featured: true,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2015-02-01 05:00:00 UTC',
  },
  {
    key: 'onlyDurationCourse',
    is_featured: false,
    duration: 'month',
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2015-03-01 05:00:00 UTC',
  },
  {
    key: 'onlyMarketingInitiativeCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: 'fakeMarkInit',
    grade_levels: null,
    cs_topic: null,
    school_subject: null,
    published_date: '2015-04-01 05:00:00 UTC',
  },
  {
    key: 'onlyOneCsTopicCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: 'fakeTopic',
    school_subject: null,
    published_date: '2015-05-01 05:00:00 UTC',
  },
  {
    key: 'onlyImportantCsTopicCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: IMPORTANT_TOPICS[0],
    school_subject: null,
    published_date: '2015-06-01 05:00:00 UTC',
  },
  {
    key: 'onlyMultipleCsTopicsCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: `fakeTopic,${IMPORTANT_TOPICS[0]}`,
    school_subject: null,
    published_date: '2015-07-01 05:00:00 UTC',
  },
  {
    key: 'onlyOneSchoolSubjectCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: 'fakeSubject1',
    published_date: '2015-08-01 05:00:00 UTC',
  },
  {
    key: 'onlyMultipleSchoolSubjectsCourse',
    is_featured: false,
    duration: null,
    marketing_initiative: null,
    grade_levels: null,
    cs_topic: null,
    school_subject: 'fakeSubject1,fakeSubject2',
    published_date: '2015-09-01 05:00:00 UTC',
  },
];

export const FAKE_FULL_CURRICULA = [
  {
    key: 'fullCourse',
    is_featured: true,
    duration: 'month',
    marketing_initiative: 'fakeMarkInit',
    grade_levels: '2,3,4,5,6',
    cs_topic: 'fakeTopic,fakeImportantTopic',
    school_subject: 'fakeSubject1,fakeSubject2',
    published_date: '2015-08-01 05:00:00 UTC',
  },
];
