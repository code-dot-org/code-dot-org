import React from 'react';
import {useSelector} from 'react-redux';
import {generatePath} from 'react-router-dom';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import NoLessonMaterialsForLegacyCourses from '@cdo/apps/templates/teacherNavigation/images/NoLessonMaterialsForLegacyCourses.png';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {selectedSectionSelector} from '../../teacherDashboard/teacherSectionsReduxSelectors';
import {Section} from '../../teacherDashboard/types/teacherSectionTypes';
import {EmptyState, EmptyStateContent} from '../EmptyState';
import {
  getNoCurriculumAssignedEmptyState,
  getNoUnitAssignedForCalendarOrLessonMaterials,
} from '../EmptyStateUtils';
import {LABELED_TEACHER_NAVIGATION_PATHS} from '../TeacherNavigationPaths';

export const CalendarEmptyState: React.FC = () => {
  const unitName = useSelector(
    (state: {unitSelection: {unitName: string}}) => state.unitSelection.unitName
  );

  const selectedSection = useAppSelector(selectedSectionSelector);
  const versionYear = useAppSelector(state => state.calendar?.versionYear);
  const isLegacyScript = versionYear ? versionYear < 2021 : false;
  const showNoCurriculumAssigned = !selectedSection.courseOfferingId;
  const emptyStateDetails = generateLessonMaterialsEmptyState(
    showNoCurriculumAssigned,
    unitName,
    selectedSection,
    isLegacyScript
  );

  if (emptyStateDetails === null) {
    return null;
  }

  return <EmptyState emptyStateDetails={emptyStateDetails} />;
};

export const getNoLessonMaterialsForLegacyCourses = (
  sectionId: number,
  courseVersionName: string
): EmptyStateContent => {
  return {
    headline: i18n.lessonMaterialsAreNotAvailable(),
    descriptionText: i18n.lessonMaterialsLegacyMessage({
      courseName: 'courseName',
    }),
    imageComponent: (
      <img src={NoLessonMaterialsForLegacyCourses} alt={i18n.almostThere()} />
    ),
    button: (
      <LinkButton
        href={
          '/teacher_dashboard' +
          generatePath(
            LABELED_TEACHER_NAVIGATION_PATHS.courseOverview.absoluteUrl,
            {
              sectionId: sectionId,
              courseVersionName: courseVersionName,
            }
          )
        }
        text={i18n.assignAUnit()}
      />
    ),
  };
};

function generateLessonMaterialsEmptyState(
  showNoCurriculumAssigned: boolean,
  unitName: string,
  selectedSection: Section,
  isLegacyScript: boolean
): EmptyStateContent | null {
  let lessonMaterialsEmptyState = null;

  if (showNoCurriculumAssigned) {
    lessonMaterialsEmptyState = getNoCurriculumAssignedEmptyState();
  } else if (
    !unitName &&
    selectedSection.courseVersionName &&
    selectedSection.courseDisplayName
  ) {
    lessonMaterialsEmptyState = getNoUnitAssignedForCalendarOrLessonMaterials(
      selectedSection.id,
      selectedSection.courseVersionName,
      selectedSection.courseDisplayName,
      i18n.lessonMaterials()
    );
  } else if (isLegacyScript && selectedSection.courseDisplayName) {
    lessonMaterialsEmptyState = getNoLessonMaterialsForLegacyCourses(
      selectedSection.id,
      selectedSection.courseDisplayName
    );
  }
  return lessonMaterialsEmptyState;
}
