import React from 'react';
import {useSelector} from 'react-redux';

import CalendarNotAvailable from '@cdo/apps/templates/teacherNavigation/images/CalendarNotAvailable.svg';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {selectedSectionSelector} from '../teacherDashboard/teacherSectionsReduxSelectors';

import {EmptyState, EmptyStateItem} from './EmptyState';
import {
  getNoCurriculumAssignedEmptyState,
  getNoUnitAssignedForCalendarOrLessonMaterials,
} from './EmptyStateUtils';

interface Section {
  id: number;
  name: string;
  createdAt?: string;
  loginType?: string;
  lessonExtras: boolean;
  pairingAllowed: boolean;
  ttsAutoplayEnabled: boolean;
  studentCount: number;
  code: string;
  courseOfferingId?: number;
  courseVersionId?: number;
  unitId?: number;
  courseId?: number;
  scriptId?: number;
  grades?: string[];
  providerManaged: boolean;
  restrictSection?: boolean;
  postMilestoneDisabled?: boolean;
  syncEnabled?: boolean;
  courseVersionName?: string;
  courseDisplayName?: string;
}

export const CalendarEmptyState: React.FC = () => {
  const unitName = useSelector(
    (state: {unitSelection: {unitName: string}}) => state.unitSelection.unitName
  );

  const selectedSection = useAppSelector(selectedSectionSelector);
  const versionYear = useAppSelector(state => state.calendar?.versionYear);
  const isLegacyScript = versionYear ? versionYear < 2021 : false;
  const hasCalendar = useAppSelector(state => state.calendar?.showCalendar);
  const showNoCurriculumAssigned = !selectedSection.courseOfferingId;
  const emptyStateDetails = generateCalendarEmptyState(
    showNoCurriculumAssigned,
    unitName,
    selectedSection,
    isLegacyScript,
    hasCalendar
  );

  if (emptyStateDetails === null) {
    return null;
  }

  return <EmptyState emptyStateDetails={emptyStateDetails} />;
};

export const getNoCalendarForLegacyCourses = (courseName: string) => {
  return {
    headline: i18n.calendarNotAvailable(),
    descriptionText: i18n.calendarLegacyMessage({courseName: courseName}),
    imageComponent: (
      <img src={CalendarNotAvailable} alt={i18n.calendarNotAvailable()} />
    ),
    button: null,
  };
};

export const getNoCalendarForThisUnit = () => {
  return {
    headline: i18n.calendarNotAvailable(),
    descriptionText: null,
    imageComponent: (
      <img src={CalendarNotAvailable} alt={i18n.calendarNotAvailable()} />
    ),
    button: null,
  };
};

function generateCalendarEmptyState(
  showNoCurriculumAssigned: boolean,
  unitName: string,
  selectedSection: Section,
  isLegacyScript: boolean,
  hasCalendar: boolean
): EmptyStateItem | null {
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
    calendarEmptyState = getNoCalendarForThisUnit();
  }
  return calendarEmptyState;
}
