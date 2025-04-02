import Button from '@code-dot-org/component-library/button';
import moment from 'moment-timezone';
import React, {Dispatch, FC, memo, useCallback} from 'react';

import {DATE_FORMAT, TIME_FORMAT} from '../../../workshopConstants';
import {SessionAction, SessionFormState} from '../../types';

import SessionPart from './components/SessionPart';

import styles from './styles.module.scss';
import commonStyles from '../../styles.module.scss';

export const generateNewSession = (
  prevSession?: SessionFormState
): SessionFormState => ({
  id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  date: prevSession
    ? moment(prevSession.date, DATE_FORMAT).add(1, 'day').format(DATE_FORMAT)
    : moment().format(DATE_FORMAT),
  start: prevSession
    ? prevSession.start
    : moment().startOf('day').add(7, 'hours').format(TIME_FORMAT),
  end: prevSession
    ? prevSession.end
    : moment().startOf('day').add(19, 'hours').format(TIME_FORMAT),
  locationAddress: prevSession?.sameAsPrevious
    ? prevSession.locationAddress
    : '',
  locationName: prevSession?.sameAsPrevious ? prevSession.locationName : '',
  meetingLink: prevSession?.sameAsPrevious ? prevSession.meetingLink : '',
  format: prevSession?.format ?? 'in_person',
  sameAsPrevious: prevSession?.sameAsPrevious ?? false,
});

export const SessionsEditor: FC<{
  sessions: SessionFormState[];
  dispatchSessions: Dispatch<SessionAction>;
}> = ({sessions, dispatchSessions}) => {
  const addSession = useCallback(() => {
    dispatchSessions({type: 'ADD_SESSION'});
  }, [dispatchSessions]);

  return (
    <>
      {sessions.map((session, i) => (
        <SessionPart
          key={session.id}
          showSameAsPrevious={i > 0}
          dispatchSessions={dispatchSessions}
          {...session}
        />
      ))}
      <div className={commonStyles.row}>
        <Button
          onClick={addSession}
          iconLeft={{iconName: 'plus'}}
          type="tertiary"
          text="Add Date"
          className={styles.addDateButton}
        />
      </div>
    </>
  );
};

export default memo(SessionsEditor);
