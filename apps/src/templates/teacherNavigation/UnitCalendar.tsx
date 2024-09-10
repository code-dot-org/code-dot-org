import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import UnitCalendarGrid from '@cdo/apps//code-studio/components/progress/UnitCalendarGrid';
import i18n from '@cdo/locale';

import {getCurrentUnitData} from '../sectionProgress/sectionProgressRedux';

const WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS = [
  45, 90, 135, 180, 225, 270, 315, 360, 405, 450,
];
export const WEEK_WIDTH = 585;

const UnitCalendar: React.FC = () => {
  const lessons = useSelector(state => getCurrentUnitData(state)?.lessons);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyInstructionalMinutes, setWeeklyInstructionalMinutes] =
    useState<number>(WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS[0]);

  useEffect(() => {
    if (lessons) {
      setIsLoading(false);
    }
  }, [lessons]);

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
    <div>
      <h2>{i18n.weeklyLessonLayout()}</h2>
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
      {!isLoading && (
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
};
