import {
  IMPORTANT_TOPICS,
  UTC_PUBLISHED_DATE_FORMAT,
  TEST_RECOMMENDER_SCORING,
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
    // Add points if given curriculum has the desired duration.
    score += hasDesiredDuration(curriculum, duration)
      ? SIMILAR_RECOMMENDER_SCORING['hasDesiredDuration']
      : 0;
    // Add points if given curriculum has the desired marketing initiative.
    score += hasDesiredMarketingInitiative(curriculum, marketingInitiative)
      ? SIMILAR_RECOMMENDER_SCORING['hasDesiredMarketingInitiative']
      : 0;
    // Add points for each overlapping desired school subject. If no overlapping school
    // subjects, then add points if the given curriculum has any school subjects.
    const numOverlappingSubjects = numOverlappingDesiredSchoolSubjects(
      curriculum,
      schoolSubjects
    );
    if (numOverlappingSubjects === 0) {
      score += hasAnySchoolSubject(curriculum)
        ? SIMILAR_RECOMMENDER_SCORING['hasAnySchoolSubject']
        : 0;
    } else {
      score +=
        SIMILAR_RECOMMENDER_SCORING['numOverlappingDesiredSchoolSubjects'] *
        numOverlappingSubjects;
    }
    // Add points for each overlapping desired CS topic.
    score +=
      numOverlappingDesiredTopics(curriculum, csTopics) *
      SIMILAR_RECOMMENDER_SCORING['numOverlappingDesiredTopics'];
    // Add points if given curriculum has an important topic that isn't one of the
    // desired ones.
    score += hasImportantButNotDesiredTopic(curriculum, csTopics)
      ? SIMILAR_RECOMMENDER_SCORING['hasImportantButNotDesiredTopic']
      : 0;
    // Add points if given curriculum was published within 2 years ago, and add more
    // points if it was published within 1 year ago.
    score += publishedWithinTwoYearsAgo(curriculum)
      ? publishedWithinOneYearAgo(curriculum)
        ? SIMILAR_RECOMMENDER_SCORING['publishedWithinOneYearAgo']
        : SIMILAR_RECOMMENDER_SCORING['publishedWithinTwoYearsAgo']
      : 0;
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
    // Add points if given curriculum has the desired duration.
    score += hasDesiredDuration(curriculum, duration)
      ? TEST_RECOMMENDER_SCORING['hasDesiredDuration']
      : 0;
    // Add points if given curriculum has the desired marketing initiative.
    score += hasDesiredMarketingInitiative(curriculum, marketingInitiative)
      ? TEST_RECOMMENDER_SCORING['hasDesiredMarketingInitiative']
      : 0;
    // Add points for each overlapping desired school subject. If no overlapping school
    // subjects, then add points if the given curriculum has any school subjects.
    const numOverlappingSubjects = numOverlappingDesiredSchoolSubjects(
      curriculum,
      schoolSubjects
    );
    if (numOverlappingSubjects === 0) {
      score += hasAnySchoolSubject(curriculum)
        ? TEST_RECOMMENDER_SCORING['hasAnySchoolSubject']
        : 0;
    } else {
      score +=
        TEST_RECOMMENDER_SCORING['overlappingDesiredSchoolSubject'] *
        numOverlappingSubjects;
    }
    // Add points for each overlapping desired CS topic.
    score +=
      numOverlappingDesiredTopics(curriculum, csTopics) *
      TEST_RECOMMENDER_SCORING['overlappingDesiredTopic'];
    // Add points if given curriculum has an important topic that isn't one of the
    // desired ones.
    score += hasImportantButNotDesiredTopic(curriculum, csTopics)
      ? TEST_RECOMMENDER_SCORING['hasImportantButNotDesiredTopic']
      : 0;
    // Add points if given curriculum was published within 2 years ago, and add more
    // points if it was published within 1 year ago.
    score += publishedWithinTwoYearsAgo(curriculum)
      ? publishedWithinOneYearAgo(curriculum)
        ? TEST_RECOMMENDER_SCORING['publishedWithinOneYearAgo']
        : TEST_RECOMMENDER_SCORING['publishedWithinTwoYearsAgo']
      : 0;
    curriculaScores.push([curriculum, score]);
  });
  return sortRecommendations(curriculaScores).map(curr => curr[0]);
};

/*
 * Scoring questions
 */
const hasDesiredDuration = (curriculum, duration) => {
  return duration && curriculum.duration === duration;
};

const hasDesiredMarketingInitiative = (curriculum, marketingInitiative) => {
  return (
    marketingInitiative &&
    curriculum.marketing_initiative === marketingInitiative
  );
};

const hasAnySchoolSubject = curriculum => {
  return !!curriculum.school_subject;
};

const numOverlappingDesiredSchoolSubjects = (curriculum, schoolSubjects) => {
  if (!curriculum.school_subject) {
    return 0;
  }

  const curriculumSubjects = curriculum.school_subject.split(',');
  const desiredSubjects = schoolSubjects?.split(',');
  return curriculumSubjects?.reduce(
    (total, currSubject) =>
      total + (desiredSubjects?.includes(currSubject) ? 1 : 0),
    0
  );
};

const hasImportantButNotDesiredTopic = (curriculum, csTopics) => {
  const curriculumTopics = curriculum.cs_topic?.split(',');
  const desiredTopics = csTopics?.split(',');

  if (curriculumTopics) {
    for (const topic of curriculumTopics) {
      if (IMPORTANT_TOPICS.includes(topic) && !desiredTopics.includes(topic)) {
        return true;
      }
    }
  }
  return false;
};

const numOverlappingDesiredTopics = (curriculum, csTopics) => {
  if (!curriculum.cs_topic) {
    return 0;
  }

  const curriculumTopics = curriculum.cs_topic.split(',');
  const desiredTopics = csTopics?.split(',');
  return curriculumTopics?.reduce(
    (total, currTopic) => total + (desiredTopics?.includes(currTopic) ? 1 : 0),
    0
  );
};

const publishedWithinTwoYearsAgo = curriculum => {
  const publishedDate = moment(
    curriculum.published_date,
    UTC_PUBLISHED_DATE_FORMAT
  );
  return twoYearsAgo <= publishedDate;
};

const publishedWithinOneYearAgo = curriculum => {
  const publishedDate = moment(
    curriculum.published_date,
    UTC_PUBLISHED_DATE_FORMAT
  );
  return oneYearAgo <= publishedDate;
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
