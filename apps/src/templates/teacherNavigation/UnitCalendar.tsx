import React, {useState, useEffect} from 'react';
// import {useSelector} from 'react-redux';
import {useSelector} from 'react-redux';

import UnitCalendarGrid from '@cdo/apps//code-studio/components/progress/UnitCalendarGrid';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

const WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS = [
  45, 90, 135, 180, 225, 270, 315, 360, 405, 450,
];
export const WEEK_WIDTH = 585;

interface CalendarLesson {
  id: number;
  lessonNumber: number;
  title: string;
  duration: number;
  assessment: boolean;
  unplugged: boolean;
  url: string;
}

const UnitCalendar: React.FC = () => {
  const [lessons, setLessons] = useState<CalendarLesson[] | null>(null);
  const [hasCalendar, setHasCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [weeklyInstructionalMinutes, setWeeklyInstructionalMinutes] =
    useState<number>(WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS[4]);

  const unitName = useSelector(
    (state: {unitSelection: {unitName: string}}) => state.unitSelection.unitName
  );

  useEffect(() => {
    if (!unitName) {
      return;
    }

    getAuthenticityToken()
      .then(token =>
        fetch(`/dashboardapi/unit_summary/${unitName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token,
          },
        })
      )
      .then(response => response.json())
      .then(responseJson => {
        // initializeRedux(responseJson, dispatch, userType, userId);  commented out to see if we can just get the data
        setLessons(responseJson.unitData.calendarLessons);
        setHasCalendar(responseJson.unitData.showCalendar);
        setIsLoading(false);
      });
  }, [unitName, lessons]);

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
          lessons={lessons}
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
