import React, {useState, useEffect} from 'react';
// import {useSelector} from 'react-redux';
import {useSelector} from 'react-redux';

import UnitCalendarGrid from '@cdo/apps//code-studio/components/progress/UnitCalendarGrid';
import {initializeRedux} from '@cdo/apps/code-studio/components/progress/TeacherUnitOverview';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

const WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS = [
  45, 90, 135, 180, 225, 270, 315, 360, 405, 450,
];
export const WEEK_WIDTH = 585;

const UnitCalendar: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false); // it is only loading when you do the fetch

  const [weeklyInstructionalMinutes, setWeeklyInstructionalMinutes] =
    useState<number>(WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS[4]);

  const unitName = useSelector(
    (state: {unitSelection: {unitName: string}}) => state.unitSelection.unitName
  );

  const unitNameFromProgress = useAppSelector(
    state => state.progress?.scriptName
  );

  const hasCalendar = useAppSelector(state => state.progress?.showCalendar);

  const calendarLessons = useAppSelector(
    state => state.progress?.calendarLessons
  );

  const {userId, userType} = useAppSelector(state => ({
    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
  }));

  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsLoading(true);
    if (
      (unitName &&
        userType &&
        userId &&
        (hasCalendar === undefined || calendarLessons === null)) ||
      unitNameFromProgress !== unitName
    ) {
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
    } else {
      setIsLoading(false);
    }
  }, [
    unitName,
    userId,
    userType,
    hasCalendar,
    calendarLessons,
    unitNameFromProgress,
    dispatch,
  ]);

  const generateDropdownOptions = () => {
    const options = WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS;
    if (!options.includes(weeklyInstructionalMinutes)) {
      options.push(weeklyInstructionalMinutes);
    }
    options.sort((a, b) => a - b);
    return options.map(val => (
      <option value={parseInt(val.toString())} key={`minutes-${val}`}>
        {i18n.minutesLabel({number: val})}
      </option>
    ));
  };

  return (
    <div style={styles.contentContainer}>
      <div style={styles.minutesPerWeekWrapper}>
        <div style={styles.minutesPerWeekDescription}>
          {i18n.instructionalMinutesPerWeek()}
        </div>
        <select
          onChange={e =>
            setWeeklyInstructionalMinutes(parseInt(e.target.value))
          }
          value={weeklyInstructionalMinutes}
          style={styles.dropdown}
        >
          {generateDropdownOptions()}
        </select>
      </div>
      {!isLoading && hasCalendar && (
        <UnitCalendarGrid
          lessons={calendarLessons}
          weeklyInstructionalMinutes={weeklyInstructionalMinutes}
          weekWidth={WEEK_WIDTH}
        />
      )}
    </div>
  );
};

export default UnitCalendar;

const styles = {
  dialog: {
    textAlign: 'left',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  button: {
    float: 'right',
    marginTop: 30,
  },
  dropdown: {
    width: 'fit-content',
    marginBottom: 0,
  },
  minutesPerWeekWrapper: {
    display: 'flex',
    marginBottom: 10,
    alignItems: 'center',
  },
  minutesPerWeekDescription: {
    fontWeight: 'bold' as const,
    marginRight: 10,
  },
  contentContainer: {
    width: 'fit-content',
  },
};
