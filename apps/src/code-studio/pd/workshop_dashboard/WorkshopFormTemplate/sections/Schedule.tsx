import {Heading2} from '@code-dot-org/component-library/typography';
import React, {FC} from 'react';

import {SessionsEditor} from '../components/SessionsEditor';
import {TimeZoneEditor} from '../components/TimeZoneEditor';
import {ScheduleProps} from '../types';

export const Schedule: FC<ScheduleProps> = ({
  state: {timeZone},
  handleChange,
  sessions,
  handleSessions,
}) => {
  return (
    <>
      <Heading2 visualAppearance="heading-sm">Schedule</Heading2>
      <TimeZoneEditor
        text="Workshop time(s) will be set to your timezone:"
        timeZone={timeZone}
        handleChange={tz => handleChange({timeZone: tz})}
      />
      <SessionsEditor sessions={sessions} handleSessions={handleSessions} />
    </>
  );
};
