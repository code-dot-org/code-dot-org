import {
  SubjectNames,
  AcademicYearWorkshopSubjects,
} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {CSF, CSD, CSP, CSA} from '../application/ApplicationConstants';

export function shouldUseFoormSurvey(subject, lastSessionDate) {
  // Local summer workshop, CSF Intro workshop, CSP workshop for returning teachers, and academic year workshops for CSP and CSD
  // after 5/8/2020 will use Foorm for survey completion.
  // CSF Deep Dive and District workshops after 9/1 will also use Foorm
  return (
    (lastSessionDate >= new Date('2020-05-08') &&
      (subject === SubjectNames.SUBJECT_SUMMER_WORKSHOP ||
        subject === SubjectNames.SUBJECT_CSF_101 ||
        subject === SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS ||
        AcademicYearWorkshopSubjects.includes(subject))) ||
    (lastSessionDate >= new Date('2020-09-01') &&
      subject === SubjectNames.SUBJECT_CSF_201) ||
    subject === SubjectNames.SUBJECT_CSF_DISTRICT
  );
}

export function shouldShowSurveyResults(state, course, subject, date) {
  const pegasusBasedCsfIntro =
    subject === SubjectNames.SUBJECT_CSF_101 &&
    !shouldUseFoormSurvey(subject, date);
  return (
    (state === 'Ended' && !pegasusBasedCsfIntro) ||
    ([CSD, CSP, CSA].includes(course) &&
      subject !== SubjectNames.SUBJECT_FIT) ||
    (course === CSF &&
      (subject === SubjectNames.SUBJECT_CSF_201 ||
        subject === SubjectNames.SUBJECT_CSF_DISTRICT))
  );
}
