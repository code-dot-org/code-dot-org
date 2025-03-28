import {Button} from '@code-dot-org/component-library/button';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import moment from 'moment-timezone';
import React, {FC, useState} from 'react';

import styles from './styles.module.scss';

const usTimeZones = moment.tz.zonesForCountry('US');

export const TimeZoneEditor: FC<{
  text: string;
  timeZone: string;
  handleChange: (tz: string) => void;
}> = ({text, timeZone, handleChange}) => {
  const [editMode, setEditMode] = useState(false);
  const [tzChanged, setTzChanged] = useState(false);

  return (
    <div className={styles.container}>
      <BodyThreeText id="tz-label">{text}</BodyThreeText>
      {editMode ? (
        <SimpleDropdown
          name="timezone"
          labelText=""
          aria-labelledby="tz-label"
          size="xs"
          className={styles.tzDropdown}
          selectedValue={timeZone}
          onChange={e => {
            setTzChanged(true);
            handleChange(e.target.value);
          }}
          items={usTimeZones.map(tz => ({value: tz, text: tz}))}
        />
      ) : (
        <BodyThreeText>
          <strong>{timeZone}</strong>
        </BodyThreeText>
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
