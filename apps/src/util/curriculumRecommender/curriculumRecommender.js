import {
  IMPORTANT_TOPICS,
  UTC_PUBLISHED_DATE_FORMAT,
  FAKE_RECOMMENDER_SCORING,
  SIMILAR_RECOMMENDER_SCORING,
} from './curriculumRecommenderConstants';
import moment from 'moment';

const now = moment().utc();
const oneYearAgo = moment()
  .utc()
  .year(now.year() - 1);
const twoYearsAgo = moment()
  .utc()
  .year(now.year() - 2);

/*
 * Curriculum recommenders: Each recommender receives an array of all curricula to consider and any preferences it should prioritize. The given
 * recommender will score each curriculum based on the questions associated with that recommender. If a curriculum satisfies the conditions of a
 * question, it receives points based on that recommender's scoring framework found in 'curriculumRecommenderConstants.js'. Once all curricula
 * have been scored, the recommender returns an array of the passed-in curricula sorted in descending order by score (ties are broken by
 * prioritizing featured curricula and more recently published curricula).
 */
export const getSimilarRecommendations = (
  curricula,
  duration,
  marketingInitiative,
  schoolSubjects,
  csTopics
) => {
  const curriculaScores = [];
  curricula.forEach(curriculum => {
    let score = 0;
    score += hasDesiredDuration(
      SIMILAR_RECOMMENDER_SCORING,
      curriculum,
      duration
    );
    score += hasDesiredMarketingInitiative(
      SIMILAR_RECOMMENDER_SCORING,
      curriculum,
      marketingInitiative
    );
    score += hasAnySchoolSubject(SIMILAR_RECOMMENDER_SCORING, curriculum);
    score += hasDesiredSchoolSubjects(
      SIMILAR_RECOMMENDER_SCORING,
      curriculum,
      schoolSubjects
    );
    score += hasAnyImportantTopic(SIMILAR_RECOMMENDER_SCORING, curriculum);
    score += hasDesiredTopics(
      SIMILAR_RECOMMENDER_SCORING,
      curriculum,
      csTopics
    );
    score += howRecentlyPublished(SIMILAR_RECOMMENDER_SCORING, curriculum);
    curriculaScores.push([curriculum, score]);
  });
  return sortRecommendations(curriculaScores).map(curr => curr[0]);
};

export const getTestRecommendations = (
  curricula,
  duration,
  marketingInitiative,
  schoolSubjects,
  csTopics
) => {
  const curriculaScores = [];
  curricula.forEach(curriculum => {
    let score = 0;
    score += hasDesiredDuration(FAKE_RECOMMENDER_SCORING, curriculum, duration);
    score += hasDesiredMarketingInitiative(
      FAKE_RECOMMENDER_SCORING,
      curriculum,
      marketingInitiative
    );
    score += hasAnySchoolSubject(FAKE_RECOMMENDER_SCORING, curriculum);
    score += hasDesiredSchoolSubjects(
      FAKE_RECOMMENDER_SCORING,
      curriculum,
      schoolSubjects
    );
    score += hasImportantButNotDesiredTopic(
      FAKE_RECOMMENDER_SCORING,
      curriculum,
      csTopics
    );
    score += hasDesiredTopics(FAKE_RECOMMENDER_SCORING, curriculum, csTopics);
    score += howRecentlyPublished(FAKE_RECOMMENDER_SCORING, curriculum);
    curriculaScores.push([curriculum, score]);
  });
  console.log('SEPARATOR');
  console.log(curriculaScores.map(curr => [curr[0].key, curr[1]]));
  return sortRecommendations(curriculaScores).map(curr => curr[0]);
};

/*
 * Scoring questions
 */
const hasDesiredDuration = (scoring_framework, curriculum, duration) => {
  return duration && curriculum.duration === duration
    ? scoring_framework['hasDesiredDuration']
    : 0;
};

const hasDesiredMarketingInitiative = (
  scoring_framework,
  curriculum,
  marketingInitiative
) => {
  return marketingInitiative &&
    curriculum.marketing_initiative === marketingInitiative
    ? scoring_framework['hasDesiredMarketingInitiative']
    : 0;
};

const hasAnySchoolSubject = (scoring_framework, curriculum) => {
  return curriculum.school_subject
    ? scoring_framework['hasAnySchoolSubject']
    : 0;
};

const hasDesiredSchoolSubjects = (
  scoring_framework,
  curriculum,
  schoolSubjects
) => {
  if (!curriculum.school_subject) {
    return 0;
  }

  const curriculumSubjects = curriculum.school_subject.split(',');
  const desiredSubjects = schoolSubjects?.split(',');

  return curriculumSubjects?.reduce(
    (total, currSubject) =>
      total +
      (desiredSubjects?.includes(currSubject)
        ? scoring_framework['hasDesiredSchoolSubjects']
        : 0),
    0
  );
};

const hasImportantButNotDesiredTopic = (
  scoring_framework,
  curriculum,
  csTopics
) => {
  const curriculumTopics = curriculum.cs_topic?.split(',');
  const desiredTopics = csTopics?.split(',');

  if (curriculumTopics) {
    for (const topic of curriculumTopics) {
      if (IMPORTANT_TOPICS.includes(topic) && !desiredTopics.includes(topic)) {
        return scoring_framework['hasImportantButNotDesiredTopic'];
      }
    }
  }
  return 0;
};

const hasDesiredTopics = (scoring_framework, curriculum, csTopics) => {
  if (!curriculum.cs_topic) {
    return 0;
  }

  const curriculumTopics = curriculum.cs_topic.split(',');
  const desiredTopics = csTopics?.split(',');

  return curriculumTopics?.reduce(
    (total, currTopic) =>
      total +
      (desiredTopics?.includes(currTopic)
        ? scoring_framework['hasDesiredTopics']
        : 0),
    0
  );
};

const howRecentlyPublished = (scoring_framework, curriculum) => {
  const publishedDate = moment(
    curriculum.published_date,
    UTC_PUBLISHED_DATE_FORMAT
  );

  if (oneYearAgo <= publishedDate) {
    return scoring_framework['publishedWithinOneYearAgo'];
  }
  if (twoYearsAgo <= publishedDate) {
    return scoring_framework['publishedWithinTwoYearsAgo'];
  }
  return 0;
};

// Sort [curriculum, score] pairs by score in descending order. If multiple curricula get the same score, featured curricula are prioritized over
// non-featured. Any remaining ties are broken by `published_date` in descending order.
const sortRecommendations = curriculumScores => {
  return curriculumScores.sort(function (a, b) {
    if (a[1] !== b[1]) {
      return b[1] - a[1];
    }
    if (a[0].is_featured !== b[0].is_featured) {
      return a[0].is_featured ? -1 : 1;
    }
    return (
      moment(b[0].published_date, UTC_PUBLISHED_DATE_FORMAT) -
      moment(a[0].published_date, UTC_PUBLISHED_DATE_FORMAT)
    );
  });
};
