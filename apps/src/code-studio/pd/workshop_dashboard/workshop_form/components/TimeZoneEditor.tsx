import {Button} from '@code-dot-org/component-library/button';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import moment from 'moment-timezone';
import React, {FC, memo, useState} from 'react';

import {WorkshopCourseConfig} from '../../workshops/types';

import styles from './TimeZoneEditor.module.scss';

const timeZonePlaceholder = 'Select a time zone';

const usTimeZones = [timeZonePlaceholder].concat(
  moment.tz.zonesForCountry('US')
);

export const TimeZoneEditor: FC<{
  timeZone: string;
  config: WorkshopCourseConfig;
  handleChange: (tz: string) => void;
}> = ({timeZone, config: {fields}, handleChange}) => {
  const [editMode, setEditMode] = useState(false);
  const [tzChanged, setTzChanged] = useState(false);

  if (!fields.time_zone) return null;

  return (
    <div className={styles.container}>
      <Typography id="tz-label" variant="body3" gutterBottom>
        {timeZone ? fields.time_zone.label : 'Workshop times are local'}
      </Typography>
      {editMode ? (
        <SimpleDropdown
          name={fields.time_zone.stateKey}
          // labelText left blank intentionally
          labelText=""
          aria-labelledby="tz-label"
          size="xs"
          className={styles.tzDropdown}
          selectedValue={timeZone}
          onChange={e => {
            setTzChanged(true);
            handleChange(e.target.value);
          }}
          items={usTimeZones.map(tz => ({
            value: tz === timeZonePlaceholder ? '' : tz,
            text: tz,
          }))}
        />
      ) : (
        <Typography variant="body3" gutterBottom>
          <strong>{timeZone}</strong>
        </Typography>
      )}
      {!editMode && (
        <Button
          type="tertiary"
          color="black"
          size="xs"
          iconLeft={{iconName: 'pencil'}}
          text={'Edit'}
          onClick={() => setEditMode(true)}
        />
      )}
      {editMode && tzChanged && (
        <FontAwesomeV6Icon
          iconName="check-circle"
          className={styles.checkIcon}
          aria-label="timezone changed"
        />
      )}
    </div>
  );
};

export default memo(TimeZoneEditor);
