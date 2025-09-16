import {Heading2} from '@code-dot-org/component-library/typography';
import React, {Dispatch, FC, memo, useCallback} from 'react';

import {
  SectionProps,
  WorkshopFormState,
  SessionFormState,
  SessionErrors,
  SessionAction,
} from '../../workshops/types';
import SessionsEditor from '../components/SessionsEditor';
import TimeZoneEditor from '../components/TimeZoneEditor';

export interface ScheduleProps
  extends SectionProps,
    Pick<WorkshopFormState, 'timeZone'> {
  sessions: SessionFormState[];
  dispatchSessions: Dispatch<SessionAction>;
  errors: SessionErrors;
}

export const Schedule: FC<ScheduleProps> = ({
  timeZone,
  sessions,
  config,
  dispatchWorkshop,
  dispatchSessions,
  errors,
}) => {
  const handleChange = useCallback(
    (tz: string) =>
      dispatchWorkshop({type: 'UPDATE_WORKSHOP', payload: {timeZone: tz}}),
    [dispatchWorkshop]
  );
  return (
    <section>
      <Heading2 visualAppearance="heading-sm">Schedule</Heading2>
      <TimeZoneEditor
        timeZone={timeZone}
        handleChange={handleChange}
        config={config}
      />
      <SessionsEditor
        sessions={sessions}
        dispatchSessions={dispatchSessions}
        fields={config.session_fields}
        errors={errors}
      />
    </section>
  );
};

export default memo(Schedule);
