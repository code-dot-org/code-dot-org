// Topics we care about promoting more than others
export const IMPORTANT_TOPICS = [
  'artificial_intelligence',
  'physical_computing',
];

export const UTC_PUBLISHED_DATE_FORMAT = 'YYYY-MM-DD hh:mm:ss UTC';

export const SIMILAR_RECOMMENDER_SCORING = {
  hasDesiredDuration: 2,
  hasDesiredMarketingInitiative: 2,
  hasAnySchoolSubject: 1,
  numOverlappingDesiredSchoolSubjects: 2,
  hasImportantButNotDesiredTopic: 1,
  numOverlappingDesiredTopics: 2,
  publishedWithinOneYearAgo: 2,
  publishedWithinTwoYearsAgo: 1,
};

// Test recommender scoring framework.
export const TEST_RECOMMENDER_SCORING = {
  hasDesiredDuration: 3,
  hasDesiredMarketingInitiative: 4,
  hasAnySchoolSubject: 1,
  overlappingDesiredSchoolSubject: 2,
  hasImportantButNotDesiredTopic: 1,
  overlappingDesiredTopic: 2,
  publishedWithinOneYearAgo: 2,
  publishedWithinTwoYearsAgo: 1,
};
