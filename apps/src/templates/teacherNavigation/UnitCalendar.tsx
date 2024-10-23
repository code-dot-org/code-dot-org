import React, {useState, useEffect} from 'react';
// import {useSelector} from 'react-redux';
import {useSelector} from 'react-redux';

import UnitCalendarGrid from '@cdo/apps//code-studio/components/progress/UnitCalendarGrid';
import {initializeRedux} from '@cdo/apps/code-studio/components/progress/TeacherUnitOverview';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import styles from './teacher-navigation.module.scss';

const WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS = [
  45, 90, 135, 180, 225, 270, 315, 360, 405, 450,
];
export const WEEK_WIDTH = 585;

const UnitCalendar: React.FC = () => {
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

  const {userId, userType} = useAppSelector(state => state.currentUser);

  const dispatch = useAppDispatch();

  useEffect(() => {
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

  return (
    <div className={styles.calendarContentContainer}>
      {isLoading && <Spinner />}
      {!isLoading && hasCalendar && (
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
            weeklyInstructionalMinutes={weeklyInstructionalMinutes}
            weekWidth={WEEK_WIDTH}
          />
        </div>
      )}
    </div>
  );
};

export default UnitCalendar;
