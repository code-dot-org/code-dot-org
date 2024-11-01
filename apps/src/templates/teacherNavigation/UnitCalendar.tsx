import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import UnitCalendarGrid from '@cdo/apps//code-studio/components/progress/UnitCalendarGrid';
import {initializeRedux} from '@cdo/apps/code-studio/components/progress/TeacherUnitOverview';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {
  EMPTY_STATE,
  EmptyState,
} from '@cdo/apps/templates/teacherNavigation/EmptyState';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import styles from './teacher-navigation.module.scss';

const WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS = [
  45, 90, 135, 180, 225, 270, 315, 360, 405, 450,
];
export const WEEK_WIDTH = 585;

interface UnitCalendarProps {
  showNoCurriculumAssigned: boolean;
  showNoUnitAssigned?: boolean;
}

const UnitCalendar: React.FC<UnitCalendarProps> = ({
  showNoCurriculumAssigned,
  showNoUnitAssigned,
}) => {
  const [isLoading, setIsLoading] = useState(false); // it is only loading when you do the fetch

  const [weeklyInstructionalMinutes, setWeeklyInstructionalMinutes] =
    useState<string>(WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS[4].toString());

  const unitName = useSelector(
    (state: {unitSelection: {unitName: string}}) => state.unitSelection.unitName
  );

  const unitNameFromProgress = useAppSelector(
    state => state.progress?.scriptName
  );

  const hasCalendar = useAppSelector(state => state.calendar?.showCalendar);

  const calendarLessons = useAppSelector(
    state => state.calendar?.calendarLessons
  );

  const versionYear = useAppSelector(state => state.calendar?.versionYear);
  const isLegacyScript = versionYear ? versionYear < 2021 : false;

  const {userId, userType} = useAppSelector(state => state.currentUser);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (showNoCurriculumAssigned || showNoUnitAssigned) return;

    if (
      (!isLoading &&
        unitName &&
        userType &&
        userId &&
        (hasCalendar === undefined || calendarLessons === null)) ||
      unitNameFromProgress !== unitName
    ) {
      setIsLoading(true);
      getAuthenticityToken()
        .then(token => {
          return fetch(`/dashboardapi/unit_summary/${unitName}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': token,
            },
          });
        })
        .then(response => response.json())
        .then(responseJson => {
          // Initialize Redux state with the new data
          initializeRedux(responseJson, dispatch, userType, userId);
          setIsLoading(false);
        });
    }
  }, [
    unitName,
    userId,
    userType,
    hasCalendar,
    calendarLessons,
    unitNameFromProgress,
    dispatch,
    isLoading,
    showNoCurriculumAssigned,
    showNoUnitAssigned,
  ]);

  const weeklyMinutesOptions = WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS.map(
    value => ({
      value: value.toString(),
      text: i18n.minutesLabel({number: value}),
    })
  );

  const handleDropdownChange = (value: string) => {
    setWeeklyInstructionalMinutes(value);
  };

  // We want to know version year even if there isn't a unit assigned
  const calendarEmptyState = showNoCurriculumAssigned
    ? EMPTY_STATE.noCurriculumAssigned
    : showNoUnitAssigned
    ? EMPTY_STATE.noUnitAssignedForCalendarOrLessonMaterials
    : isLegacyScript
    ? EMPTY_STATE.noCalendarForLegacyCourses
    : !hasCalendar
    ? EMPTY_STATE.noCalendarForThisUnit
    : null;

  return (
    <div className={styles.calendarContentContainer}>
      {isLoading && <Spinner />}
      {!isLoading && calendarEmptyState && (
        <EmptyState emptyState={calendarEmptyState} />
      )}
      {!isLoading && !calendarEmptyState && (
        <div>
          <div className={styles.minutesPerWeekWrapper}>
            <div className={styles.minutesPerWeekDescription}>
              {i18n.instructionalMinutesPerWeek()}
            </div>
            <SimpleDropdown
              name="minutesPerWeek"
              onChange={event => handleDropdownChange(event.target.value)}
              items={weeklyMinutesOptions}
              selectedValue={weeklyInstructionalMinutes}
              size="s"
              dropdownTextThickness="thin"
              labelText="minutes per week dropdown"
              isLabelVisible={false}
            />
          </div>
          <UnitCalendarGrid
            lessons={calendarLessons}
            weeklyInstructionalMinutes={parseInt(weeklyInstructionalMinutes)}
            weekWidth={WEEK_WIDTH}
          />
        </div>
      )}
    </div>
  );
};

export default UnitCalendar;
