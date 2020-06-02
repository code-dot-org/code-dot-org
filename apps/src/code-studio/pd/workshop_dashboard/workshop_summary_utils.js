import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

export function useFoormSurvey(subject, lastSessionDate) {
  // Local summer, CSF Intro, or CSP for returning teachings workshop
  // after 5/8/2020 will use Foorm for survey completion.
  return (
    lastSessionDate >= new Date('2020-05-08') &&
    (subject === SubjectNames.SUBJECT_SUMMER_WORKSHOP ||
      subject === SubjectNames.SUBJECT_CSF_101 ||
      subject === SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS)
  );
}
