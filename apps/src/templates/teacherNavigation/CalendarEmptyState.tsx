import React from 'react';

import CalendarNotAvailable from '@cdo/apps/templates/teacherNavigation/images/CalendarNotAvailable.svg';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {selectedSectionSelector} from '../teacherDashboard/teacherSectionsReduxSelectors';
import {Section} from '../teacherDashboard/types/teacherSectionTypes';

import {EmptyState, EmptyStateProps} from './EmptyState';
import {
  getNoCurriculumAssignedEmptyState,
  getNoUnitAssignedForCalendarOrLessonMaterials,
} from './EmptyStateUtils';

export const CalendarEmptyState: React.FC = () => {
  const selectedSection = useAppSelector(selectedSectionSelector);
  const versionYear = useAppSelector(state => state.calendar?.versionYear);
  const isLegacyScript = versionYear ? versionYear < 2021 : false;
  const hasCalendar = useAppSelector(state => state.calendar?.showCalendar);
  const showNoCurriculumAssigned = !selectedSection.courseOfferingId;
  const emptyStateDetails = generateCalendarEmptyState(
    showNoCurriculumAssigned,
    selectedSection.unitName,
    selectedSection,
    isLegacyScript,
    hasCalendar
  );

  if (emptyStateDetails === null) {
    return null;
  }

  return <EmptyState {...emptyStateDetails} />;
};

export const getNoCalendarForLegacyCourses = (
  courseName: string
): EmptyStateProps => {
  return {
    headline: i18n.calendarNotAvailable(),
    descriptionText: i18n.calendarLegacyMessage({courseName: courseName}),
    imageComponent: (
      <img src={CalendarNotAvailable} alt={i18n.calendarNotAvailable()} />
    ),
    button: null,
  };
};

export const getNoCalendarForThisUnit: EmptyStateProps = {
  headline: i18n.calendarNotAvailable(),
  descriptionText: null,
  imageComponent: (
    <img src={CalendarNotAvailable} alt={i18n.calendarNotAvailable()} />
  ),
  button: null,
};

function generateCalendarEmptyState(
  showNoCurriculumAssigned: boolean,
  unitName: string,
  selectedSection: Section,
  isLegacyScript: boolean,
  hasCalendar: boolean
): EmptyStateProps | null {
  let calendarEmptyState = null;

  if (showNoCurriculumAssigned) {
    calendarEmptyState = getNoCurriculumAssignedEmptyState();
  } else if (
    !unitName &&
    selectedSection.courseVersionName &&
    selectedSection.courseDisplayName
  ) {
    calendarEmptyState = getNoUnitAssignedForCalendarOrLessonMaterials(
      selectedSection.id,
      selectedSection.courseVersionName,
      selectedSection.courseDisplayName,
      i18n.theCalendar()
    );
  } else if (isLegacyScript && selectedSection.courseDisplayName) {
    calendarEmptyState = getNoCalendarForLegacyCourses(
      selectedSection.courseDisplayName
    );
  } else if (!hasCalendar) {
    calendarEmptyState = getNoCalendarForThisUnit;
  }
  return calendarEmptyState;
}
