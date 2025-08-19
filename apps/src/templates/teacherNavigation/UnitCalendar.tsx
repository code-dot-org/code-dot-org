import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import UnitCalendarGrid from '@cdo/apps//code-studio/components/progress/UnitCalendarGrid';
import {setCalendarData} from '@cdo/apps/code-studio/calendarRedux';
import {
  setUnitSummaryReduxData,
  UnitSummaryResponse,
} from '@cdo/apps/code-studio/components/progress/UnitSummaryUtils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  asyncLoadCoursesWithProgress,
  getSelectedUnitName,
  getSelectedUnitPosition,
  getSelectedCourseName,
} from '@cdo/apps/redux/unitSelectionRedux';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import UnitSelectorV2 from '../UnitSelectorV2';

import {CalendarEmptyState} from './CalendarEmptyState';

import styles from './teacher-navigation.module.scss';

const WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS = [
  45, 90, 135, 180, 225, 270, 315, 360, 405, 450,
];
export const WEEK_WIDTH = 800;

const UnitCalendar: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const [weeklyInstructionalMinutes, setWeeklyInstructionalMinutes] =
    useState<string>(WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS[4].toString());

  const selectedSection = useAppSelector(selectedSectionSelector);

  const unitName = useSelector(state => getSelectedUnitName(state));
  let unitPosition = useSelector(state => getSelectedUnitPosition(state));
  let courseName = useSelector(state => getSelectedCourseName(state));

  if (!(unitPosition && courseName)) {
    unitPosition = selectedSection.unitPosition;
    courseName = selectedSection.courseVersionName;
  }

  const hasCalendar = useAppSelector(state => state.calendar?.showCalendar);

  const calendarLessons = useAppSelector(
    state => state.calendar?.calendarLessons
  );

  const calendarCourseName = useAppSelector(
    state => state.calendar?.courseName
  );
  const calendarUnitPosition = useAppSelector(
    state => state.calendar?.unitPosition
  );

  const {userId, userType} = useAppSelector(state => state.currentUser);

  const isLoadingCoursesWithProgress = useSelector(
    (state: {unitSelection: {isLoadingCoursesWithProgress: boolean}}) =>
      state.unitSelection.isLoadingCoursesWithProgress
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncLoadCoursesWithProgress());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedSection.courseOfferingId || !(courseName && unitPosition)) {
      dispatch(
        setCalendarData({
          unitName: null,
          unitPosition: null,
          courseName: null,
          showCalendar: false,
          calendarLessons: null,
          versionYear: null,
        })
      );
    } else if (
      !isLoading &&
      courseName &&
      unitPosition &&
      userType &&
      userId &&
      (hasCalendar === undefined ||
        calendarLessons === null ||
        courseName !== calendarCourseName ||
        unitPosition !== calendarUnitPosition)
    ) {
      setIsLoading(true);
      const fetchUnitSummaryPath = `/dashboardapi/unit_summary/${courseName}/${unitPosition}`;
      HttpClient.fetchJson<UnitSummaryResponse>(fetchUnitSummaryPath)
        .then(response => response?.value)
        .then(responseJson => {
          // Initialize Redux state with the new data
          setUnitSummaryReduxData(responseJson, dispatch, userType, userId);
          setIsLoading(false);

          analyticsReporter.sendEvent(EVENTS.VIEW_UNIT_CALENDAR, {
            unitName,
          });
        })
        .catch(error => {
          console.error('Error loading unit calendar', error);

          analyticsReporter.sendEvent(EVENTS.UNIT_CALENDAR_FAILURE, {
            unitName,
          });
          return null;
        });
    }

    setHasInitialLoad(true);
  }, [
    unitName,
    userId,
    userType,
    hasCalendar,
    calendarLessons,
    dispatch,
    isLoading,
    selectedSection.courseOfferingId,
    selectedSection.courseVersionName,
    courseName,
    unitPosition,
    calendarCourseName,
    calendarUnitPosition,
  ]);

  const weeklyMinutesOptions = WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS.map(
    value => ({
      value: value.toString(),
      text: i18n.minutesLabel({number: value}),
    })
  );

  const handleDropdownChange = (value: string) => {
    setWeeklyInstructionalMinutes(value);

    analyticsReporter.sendEvent(EVENTS.CHANGED_CALENDAR_MINUTES, {
      unitName,
      minutes: value,
    });
  };

  const needsReload = useAppSelector(
    state => state.teacherSections.needsReload
  );

  if (
    !hasInitialLoad ||
    isLoading ||
    isLoadingCoursesWithProgress ||
    needsReload
  ) {
    return <Spinner size={'large'} />;
  }

  return (
    <div>
      {<CalendarEmptyState />}
      <div className={styles.calendarContentContainer}>
        {hasCalendar && (
          <div>
            <div className={styles.calendarDropdowns}>
              <div className={styles.calendarDropdown}>
                <div className={styles.calendarDropdownDescription}>
                  {i18n.lessonsFor()}
                </div>
                <UnitSelectorV2
                  className={styles.calendarUnitDropdown}
                  filterToSelectedCourse={true}
                />
              </div>
              <div className={styles.calendarDropdown}>
                <div className={styles.calendarDropdownDescription}>
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
                  color="gray"
                />
              </div>
            </div>
            <UnitCalendarGrid
              lessons={calendarLessons || []}
              weeklyInstructionalMinutes={parseInt(weeklyInstructionalMinutes)}
              weekWidth={WEEK_WIDTH}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitCalendar;
