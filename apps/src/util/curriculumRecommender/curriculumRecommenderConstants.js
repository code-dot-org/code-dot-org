// Topics we care about promoting more than others
export const IMPORTANT_TOPICS = [
  'artificial_intelligence',
  'physical_computing',
];

export const UTC_PUBLISHED_DATE_FORMAT = 'YYYY-MM-DD hh:mm:ss UTC';

// Test recommender scoring framework.
export const TEST_RECOMMENDER_SCORING = {
  hasDesiredDuration: 3,
  hasDesiredMarketingInitiative: 4,
  hasAnySchoolSubject: 1,
  hasDesiredSchoolSubjects: 2,
  hasImportantButNotDesiredTopic: 1,
  hasDesiredTopics: 2,
  publishedWithinOneYearAgo: 2,
  publishedWithinTwoYearsAgo: 1,
};
