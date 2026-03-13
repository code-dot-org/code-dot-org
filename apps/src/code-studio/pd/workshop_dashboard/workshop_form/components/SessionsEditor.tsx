import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import moment from 'moment-timezone';
import React, {Dispatch, FC, memo, useCallback} from 'react';

import {DATE_FORMAT, TIME_FORMAT} from '../../workshopConstants';
import {
  SessionFormState,
  SessionFields,
  SessionErrors,
  SessionAction,
} from '../../workshops/types';

import SessionPart from './SessionPart';

import styles from './SessionsEditor.module.scss';
import commonStyles from '../WorkshopForm.module.scss';

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
  locationAddress: '',
  locationName: '',
  meetingLink: '',
  format: prevSession?.format ?? 'in_person',
});

export const SessionsEditor: FC<{
  sessions: SessionFormState[];
  fields: SessionFields;
  dispatchSessions: Dispatch<SessionAction>;
  errors: SessionErrors;
}> = ({sessions, fields, dispatchSessions, errors}) => {
  const addSession = useCallback(() => {
    dispatchSessions({type: 'ADD_SESSION'});
  }, [dispatchSessions]);

  return (
    <>
      {sessions.map((session, i) => (
        <SessionPart
          key={session.id}
          deleteDisabled={sessions.length <= 1}
          dispatchSessions={dispatchSessions}
          fields={fields}
          errors={errors[session.id]}
          {...session}
        />
      ))}
      <div className={commonStyles.row}>
        <MuiButton
          variant="text"
          color="primary"
          size="medium"
          className={styles.addDateButton}
          onClick={addSession}
          type="button"
          startIcon={<FontAwesomeV6Icon iconName="plus" />}
        >
          Add Date
        </MuiButton>
      </div>
    </>
  );
};

export default memo(SessionsEditor);
