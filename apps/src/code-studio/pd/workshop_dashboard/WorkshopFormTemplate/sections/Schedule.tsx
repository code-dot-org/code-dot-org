import {Heading2} from '@code-dot-org/component-library/typography';
import React, {FC, useCallback} from 'react';

import {SessionsEditor} from '../components/SessionsEditor';
import {TimeZoneEditor} from '../components/TimeZoneEditor';
import {ScheduleProps} from '../types';

export const Schedule: FC<ScheduleProps> = ({
  timeZone,
  sessions,
  dispatchWorkshop,
  dispatchSessions,
}) => {
  const handleChange = useCallback(
    (tz: string) =>
      dispatchWorkshop({type: 'UPDATE_WORKSHOP', payload: {timeZone: tz}}),
    [dispatchWorkshop]
  );
  return (
    <>
      <Heading2 visualAppearance="heading-sm">Schedule</Heading2>
      <TimeZoneEditor
        text="Workshop time(s) will be set to your timezone:"
        timeZone={timeZone}
        handleChange={handleChange}
      />
      <SessionsEditor sessions={sessions} dispatchSessions={dispatchSessions} />
    </>
  );
};
