import {
  IMPORTANT_TOPICS,
  FAKE_RECOMMENDER_SCORING,
} from './curriculumRecommenderConstants';

// [TODO]: Add general comment on how these recommendations work and where the edges of this black box are (i.e. filters before, returns array)

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
    score += hasAnySchoolSubject(FAKE_RECOMMENDER_SCORING, curriculum);
    score += hasDesiredSchoolSubjects(
      FAKE_RECOMMENDER_SCORING,
      curriculum,
      schoolSubjects
    );
    score += hasAnyImportantTopic(FAKE_RECOMMENDER_SCORING, curriculum);
    score += hasDesiredTopics(FAKE_RECOMMENDER_SCORING, curriculum, csTopics);
    score += hasDesiredDuration(FAKE_RECOMMENDER_SCORING, curriculum, duration);
    score += hasDesiredMarketingInitiative(
      FAKE_RECOMMENDER_SCORING,
      curriculum,
      marketingInitiative
    );
    score += howRecentlyPublished(FAKE_RECOMMENDER_SCORING, curriculum);
    curriculaScores.push([curriculum, score]);
  });

  const test = curriculaScores.map(c => [c[0].key, c[1]]);
  console.log(test);

  return sortRecommendations(curriculaScores).map(curr => curr[0]);
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
  const curriculumSubjects = curriculum.school_subject?.split(',');
  const desiredSubjects = schoolSubjects?.split(',');

  const total = curriculumSubjects?.reduce(
    (total, currTopic) =>
      total +
      (desiredSubjects?.includes(currTopic)
        ? scoring_framework['hasDesiredSchoolSubjects']
        : 0),
    0
  );
  return total ? total : 0;
};

const hasAnyImportantTopic = (scoring_framework, curriculum) => {
  const csTopics = curriculum.cs_topic?.split(',');
  if (csTopics) {
    for (const topic of csTopics) {
      if (IMPORTANT_TOPICS.includes(topic)) {
        return scoring_framework['hasAnyImportantTopic'];
      }
    }
  }
  return 0;
};

const hasDesiredTopics = (scoring_framework, curriculum, csTopics) => {
  const curriculumTopics = curriculum.cs_topic?.split(',');
  const desiredTopics = csTopics?.split(',');

  const total = curriculumTopics?.reduce(
    (total, currTopic) =>
      total +
      (desiredTopics?.includes(currTopic)
        ? scoring_framework['hasDesiredTopics']
        : 0),
    0
  );
  return total ? total : 0;
};

const hasDesiredDuration = (scoring_framework, curriculum, duration) => {
  return curriculum.duration === duration
    ? scoring_framework['hasDesiredDuration']
    : 0;
};

const hasDesiredMarketingInitiative = (
  scoring_framework,
  curriculum,
  marketingInitiative
) => {
  return curriculum.marketing_initiative === marketingInitiative
    ? scoring_framework['hasDesiredMarketingInitiative']
    : 0;
};

const howRecentlyPublished = (scoring_framework, curriculum) => {
  const date = new Date(curriculum.published_date);
  console.log(date);
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
    return new Date(b[0].published_date) - new Date(a[0].published_date);
  });
};
