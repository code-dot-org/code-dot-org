import moment from 'moment';

import {
  IMPORTANT_TOPICS,
  CURRICULUM_DURATIONS,
  UTC_PUBLISHED_DATE_FORMAT,
  TEST_RECOMMENDER_SCORING,
  SIMILAR_RECOMMENDER_SCORING,
  STRETCH_RECOMMENDER_SCORING,
} from './curriculumRecommenderConstants';

const now = moment().utc();

/*
 * Curriculum recommenders: Each recommender receives an array of all curricula to consider and any preferences it should prioritize. The given
 * recommender will filter out non-applicable curricula (such as those that don't support the right grade levels). It will then score each
 * curriculum based on the questions associated with that recommender. If a curriculum satisfies the conditions of a question, it receives
 * points based on that recommender's scoring framework found in 'curriculumRecommenderConstants.js'. Once all curricula have been scored, the
 * recommender returns an array of the passed-in curricula sorted in descending order by score (ties are broken by prioritizing featured
 * curricula and more recently published curricula).
 */

// Similar Curriculum Recommender:
//    1) Filters out the curriculum with the a key of mainCurriculumKey, any curricula that do not support any of mainCurriculum's grade levels,
//        and (if applicable) any curricula the user has taught before
//    2) Scores the remaining curricula to find which are most similar to mainCurriculum
// curriculaData: curricula to filter, score, and sort
// mainCurriculumKey: the key of the curriculum to compare all other curricula to find a similar recommendation for
// curriculaTaught: curricula the user has taught before (if a signed-in teacher)
export const getSimilarRecommendations = (
  curriculaData,
  mainCurriculumKey,
  curriculaTaught
) => {
  // Create copy of array of curricula to not affect the curriculaData array passed in
  let curricula = [...curriculaData];

  // Filter out the curriculum with the key, mainCurriculumKey, from the curricula to consider
  const mainCurriculumIndex = curricula.findIndex(
    e => e.key === mainCurriculumKey
  );
  const mainCurriculum = curricula.splice(mainCurriculumIndex, 1)[0];

  // Filter out curricula that don't support any of the same grade levels
  curricula = filterHasOverlappingGradeLevels(
    curricula,
    mainCurriculum.grade_levels
  );

  // (if signed-in teacher) Filter out curricula the user has taught before
  if (curriculaTaught) {
    curricula = filterNotTaughtBefore(curricula, curriculaTaught);
  }

  // Score each remaining curricula
  const curriculaScores = [];
  curricula.forEach(curriculum => {
    let score = 0;

    // Add points if given curriculum has the desired duration.
    score += hasDesiredDuration(curriculum, mainCurriculum.duration)
      ? SIMILAR_RECOMMENDER_SCORING['hasDesiredDuration']
      : 0;

    // Add points if given curriculum has the desired marketing initiative.
    score += hasDesiredMarketingInitiative(
      curriculum,
      mainCurriculum.marketing_initiative
    )
      ? SIMILAR_RECOMMENDER_SCORING['hasDesiredMarketingInitiative']
      : 0;

    // Add points for each overlapping desired school subject. If no overlapping school
    // subjects, then add points if the given curriculum has any school subjects.
    const numOverlappingSubjects = numOverlappingDesiredSchoolSubjects(
      curriculum,
      mainCurriculum.school_subject
    );
    if (numOverlappingSubjects === 0) {
      score += hasAnySchoolSubject(curriculum)
        ? SIMILAR_RECOMMENDER_SCORING['hasAnySchoolSubject']
        : 0;
    } else {
      score +=
        SIMILAR_RECOMMENDER_SCORING['overlappingDesiredSchoolSubject'] *
        numOverlappingSubjects;
    }

    // Add points for each overlapping desired CS topic.
    score +=
      numOverlappingDesiredTopics(curriculum, mainCurriculum.cs_topic) *
      SIMILAR_RECOMMENDER_SCORING['overlappingDesiredTopic'];

    // Add points if given curriculum has an important topic that isn't one of the
    // desired ones.
    score += hasImportantButNotDesiredTopic(curriculum, mainCurriculum.cs_topic)
      ? SIMILAR_RECOMMENDER_SCORING['hasImportantButNotDesiredTopic']
      : 0;

    // Add points if given curriculum was published within 2 years ago, and add more
    // points if it was published within 1 year ago.
    const publishedYearsAgo = publishedNumYearsAgo(curriculum);
    if (publishedYearsAgo < 2) {
      score +=
        publishedYearsAgo < 1
          ? SIMILAR_RECOMMENDER_SCORING['publishedWithinOneYearAgo']
          : SIMILAR_RECOMMENDER_SCORING['publishedWithinTwoYearsAgo'];
    }
    curriculaScores.push([curriculum, score]);
  });
  return sortRecommendations(curriculaScores).map(curr => curr[0]);
};

// Stretch Curriculum Recommender:
//    1) Filters out the curriculum with the a key of mainCurriculumKey, any curricula that do not support any of mainCurriculum's grade levels,
//        and (if applicable) any curricula the user has taught before
//    2) Scores the remaining curricula to find which is the best stretch fit for the mainCurriculum
// curriculaData: curricula to filter, score, and sort
// mainCurriculumKey: the key of the curriculum to compare all other curricula to find a stretch recommendation for
// curriculaTaught: curricula the user has taught before (if a signed-in teacher)
export const getStretchRecommendations = (
  curriculaData,
  mainCurriculumKey,
  curriculaTaught
) => {
  // Create copy of array of curricula to not affect the curriculaData array passed in
  let curricula = [...curriculaData];

  // Filter out the curriculum with the key, mainCurriculumKey, from the curricula to consider
  const mainCurriculumIndex = curricula.findIndex(
    e => e.key === mainCurriculumKey
  );
  const mainCurriculum = curricula.splice(mainCurriculumIndex, 1)[0];

  // Filter out curricula that don't support any of the same grade levels
  curricula = filterHasOverlappingGradeLevels(
    curricula,
    mainCurriculum.grade_levels
  );

  // (if signed-in teacher) Filter out curricula the user has taught before
  if (curriculaTaught) {
    curricula = filterNotTaughtBefore(curricula, curriculaTaught);
  }

  // Score each remaining curricula
  const curriculaScores = [];
  curricula.forEach(curriculum => {
    let score = 0;

    // Add points if given curriculum has a slighty longer duration.
    score += hasSlightlyLongerDuration(curriculum, mainCurriculum.duration)
      ? STRETCH_RECOMMENDER_SCORING['hasDesiredDuration']
      : 0;

    // Add points if given curriculum has a DIFFERENT marketing initiative.
    score += hasDesiredMarketingInitiative(
      curriculum,
      mainCurriculum.marketing_initiative
    )
      ? 0
      : STRETCH_RECOMMENDER_SCORING['hasDesiredMarketingInitiative'];

    // Adds points for having NO school subject. If it has school subjects, then add
    // points if it's NOT overlapping with the mainCurriculum's subjects.
    if (!hasAnySchoolSubject(curriculum)) {
      score += STRETCH_RECOMMENDER_SCORING['hasAnySchoolSubject'];
    } else {
      const numOverlappingSubjects = numOverlappingDesiredSchoolSubjects(
        curriculum,
        mainCurriculum.school_subject
      );
      score +=
        numOverlappingSubjects === 0
          ? STRETCH_RECOMMENDER_SCORING['overlappingDesiredSchoolSubject']
          : 0;
    }

    // Add points if given curriculum has an important topic.
    score += hasImportantButNotDesiredTopic(curriculum, '')
      ? STRETCH_RECOMMENDER_SCORING['hasImportantButNotDesiredTopic']
      : 0;

    // Add points if given curriculum was published within 2 years ago, and add more
    // points if it was published within 1 year ago.
    const publishedYearsAgo = publishedNumYearsAgo(curriculum);
    if (publishedYearsAgo < 2) {
      score +=
        publishedYearsAgo < 1
          ? STRETCH_RECOMMENDER_SCORING['publishedWithinOneYearAgo']
          : STRETCH_RECOMMENDER_SCORING['publishedWithinTwoYearsAgo'];
    }
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

    // Add points if given curriculum has a slighty longer duration
    score += hasSlightlyLongerDuration(curriculum, duration)
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
    const publishedYearsAgo = publishedNumYearsAgo(curriculum);
    if (publishedYearsAgo < 2) {
      score +=
        publishedYearsAgo < 1
          ? TEST_RECOMMENDER_SCORING['publishedWithinOneYearAgo']
          : TEST_RECOMMENDER_SCORING['publishedWithinTwoYearsAgo'];
    }
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

const hasSlightlyLongerDuration = (curriculum, duration) => {
  const durationIndex = CURRICULUM_DURATIONS.findIndex(d => d === duration);
  const slightlyLongerDurationIndex = durationIndex + 1;

  return (
    slightlyLongerDurationIndex <= CURRICULUM_DURATIONS.length - 1 &&
    CURRICULUM_DURATIONS[slightlyLongerDurationIndex] === curriculum.duration
  );
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
      if (IMPORTANT_TOPICS.includes(topic) && !desiredTopics?.includes(topic)) {
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

// Returns the number of years ago the given curriculum was published (rounded down).
const publishedNumYearsAgo = curriculum => {
  const publishedDate = moment(
    curriculum.published_date,
    UTC_PUBLISHED_DATE_FORMAT
  );
  return now.diff(publishedDate, 'years', false);
};

/*
 * Helper functions
 */
const filterHasOverlappingGradeLevels = (curricula, desired_grade_levels) => {
  return curricula.filter(curr =>
    curr.grade_levels
      ?.split(',')
      ?.some(grade => desired_grade_levels.includes(grade))
  );
};

const filterNotTaughtBefore = (curricula, curriculaTaught) => {
  return curricula.filter(
    curr => !curriculaTaught.includes(curr.course_offering_id)
  );
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
