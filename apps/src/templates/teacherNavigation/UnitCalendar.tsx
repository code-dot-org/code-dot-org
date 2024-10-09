import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import UnitCalendarGrid from '@cdo/apps//code-studio/components/progress/UnitCalendarGrid';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import i18n from '@cdo/locale';

import {getCurrentUnitData} from '../sectionProgress/sectionProgressRedux';

import styles from './teacher-navigation.module.scss';

const WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS = [
  45, 90, 135, 180, 225, 270, 315, 360, 405, 450,
];
export const WEEK_WIDTH = 585;

const UnitCalendar: React.FC = () => {
  const lessons = useSelector(state => getCurrentUnitData(state)?.lessons);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyInstructionalMinutes, setWeeklyInstructionalMinutes] =
    useState<string>(WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS[4].toString());

  useEffect(() => {
    if (lessons) {
      setIsLoading(false);
    }
  }, [lessons]);

  const weeklyMinutesOptions = WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS.map(
    value => ({
      value: value.toString(),
      text: i18n.minutesLabel({number: value}),
    })
  );

  // const generateDropdownOptions = () => {
  //   const options = WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS;
  //   if (!options.includes(weeklyInstructionalMinutes)) {
  //     options.push(weeklyInstructionalMinutes);
  //   }
  //   options.sort((a, b) => a - b);
  //   return options.map(val => (
  //     <option value={parseInt(val.toString())} key={`minutes-${val}`}>
  //       {i18n.minutesLabel({number: val})}
  //     </option>
  //   ));
  // };

  const handleDropdownChange = (value: string) => {
    setWeeklyInstructionalMinutes(value);
  };

  return (
    <div className={styles.calendarContentContainer}>
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
        {/* <select
          onChange={e =>
            setWeeklyInstructionalMinutes(parseInt(e.target.value))
          }
          value={weeklyInstructionalMinutes}
          className={styles.calendarDropdown}
        >
          {generateDropdownOptions()}
        </select> */}
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
