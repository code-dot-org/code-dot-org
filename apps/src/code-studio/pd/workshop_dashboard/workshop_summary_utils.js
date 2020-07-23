import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {CSF, CSD, CSP} from '../application/ApplicationConstants';

export function useFoormSurvey(subject, lastSessionDate) {
  // Local summer workshop, CSF Intro workshop, or CSP workshop for returning teachers
  // after 5/8/2020 will use Foorm for survey completion.
  return (
    lastSessionDate >= new Date('2020-05-08') &&
    (subject === SubjectNames.SUBJECT_SUMMER_WORKSHOP ||
      subject === SubjectNames.SUBJECT_CSF_101 ||
      subject === SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS)
  );
}

export function shouldShowSurveyResults(state, course, subject, date) {
  const pegasusBasedCsfIntro =
    subject === SubjectNames.SUBJECT_CSF_101 && !useFoormSurvey(subject, date);
  return (
    (state === 'Ended' && !pegasusBasedCsfIntro) ||
    ([CSD, CSP].includes(course) && subject !== SubjectNames.SUBJECT_FIT) ||
    (course === CSF && subject === SubjectNames.SUBJECT_CSF_201)
  );
}
