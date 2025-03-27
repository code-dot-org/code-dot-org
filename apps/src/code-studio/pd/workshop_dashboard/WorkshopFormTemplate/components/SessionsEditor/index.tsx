import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import moment from 'moment-timezone';
import React, {FC, useMemo} from 'react';

import {PdSessionFormats} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {DATE_FORMAT, TIME_FORMAT} from '../../../workshopConstants';
import {SessionFormat, SessionFormState} from '../../types';

import styles from './styles.module.scss';
import commonStyles from '../../styles.module.scss';

export const generateNewSession = (
  prevSession?: SessionFormState
): SessionFormState => ({
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
  handleSessions: (sessions: SessionFormState[]) => void;
}> = ({sessions, handleSessions}) => {
  const getHandleSession = (index: number) => (session: SessionFormState) => {
    const newSessions = [...sessions];
    newSessions[index] = session;
    handleSessions(newSessions);
  };

  const getDeleteSession = (index: number) => () => {
    const newSessions = [...sessions];
    newSessions.splice(index, 1);
    handleSessions(newSessions);
  };

  const getHandleSameAsPrevious =
    (index: number) => (sameAsPrevious: boolean) => {
      const currentSession = {...sessions[index]};
      currentSession.sameAsPrevious = sameAsPrevious;
      const prevSession = sessions[index - 1];
      if (sameAsPrevious && prevSession) {
        currentSession.locationAddress = prevSession.locationAddress;
        currentSession.locationName = prevSession.locationName;
        currentSession.meetingLink = prevSession.meetingLink;
      }
      const newSessions = [...sessions];
      newSessions.splice(index, 1, currentSession);
      handleSessions(newSessions);
    };

  const addSession = () => {
    const newSessions = [...sessions];
    newSessions.push(generateNewSession(sessions[sessions.length - 1]));
    handleSessions(newSessions);
  };

  return (
    <>
      {sessions.map((session, i) => (
        <SessionPart
          key={i}
          session={session}
          handleSession={getHandleSession(i)}
          deleteSession={getDeleteSession(i)}
          showSameAsPrevious={i > 0}
          handleSameAsPrevious={getHandleSameAsPrevious(i)}
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

export const SessionPart: FC<{
  session: SessionFormState;
  handleSession: (session: SessionFormState) => void;
  deleteSession: () => void;
  handleSameAsPrevious: (checked: boolean) => void;
  showSameAsPrevious: boolean;
}> = ({
  session,
  handleSession,
  deleteSession,
  showSameAsPrevious,
  handleSameAsPrevious,
}) => {
  const timeOptions = useMemo(() => {
    const startTime = moment().startOf('day').add(7, 'hours');
    const endTime = moment().startOf('day').add(19, 'hours');
    const timeOptions: {value: string; text: string}[] = [];

    while (startTime.isSameOrBefore(endTime)) {
      timeOptions.push({
        value: startTime.format(TIME_FORMAT),
        text: startTime.format(TIME_FORMAT),
      });
      startTime.add(30, 'minutes');
    }
    return timeOptions;
  }, []);

  const sameAsPreviousLabel = useMemo(() => {
    if (session.format === 'in_person') {
      return 'Location';
    }
    if (session.format === 'virtual') {
      return 'Meeting link';
    }
    return '';
  }, [session.format]);

  return (
    <>
      <div className={classNames(commonStyles.row, styles.sessionRow)}>
        <TextField
          label="Date"
          name="date"
          inputType="date"
          size="s"
          className={classNames(commonStyles.item, commonStyles.required)}
          value={session.date}
          onChange={e => {
            handleSession({...session, date: e.target.value});
          }}
        />
        <SimpleDropdown
          name="start time"
          labelText="Start Time"
          onChange={e => {
            handleSession({...session, start: e.target.value});
          }}
          iconLeft={{iconName: 'clock'}}
          selectedValue={session.start}
          items={timeOptions}
          dropdownTextThickness="thin"
          size="s"
          className={classNames(
            commonStyles.item,
            styles.timeDropdown,
            commonStyles.required
          )}
        />
        <SimpleDropdown
          name="end time"
          labelText="End Time"
          onChange={e => {
            handleSession({...session, end: e.target.value});
          }}
          iconLeft={{iconName: 'clock'}}
          selectedValue={session.end}
          items={timeOptions}
          dropdownTextThickness="thin"
          size="s"
          className={classNames(
            commonStyles.item,
            styles.timeDropdown,
            commonStyles.required
          )}
        />
        <SimpleDropdown
          name="format"
          labelText="Format"
          onChange={e => {
            const format = e.target.value as SessionFormat;
            handleSession({...session, format});
          }}
          selectedValue={session.format}
          items={PdSessionFormats.map(({value, label}) => ({
            value,
            text: label,
          }))}
          dropdownTextThickness="thin"
          size="s"
          className={classNames(commonStyles.item, commonStyles.required)}
        />
        <Button
          icon={{iconName: 'minus'}}
          onClick={deleteSession}
          isIconOnly={true}
          className={styles.deleteButton}
          type="secondary"
          color="destructive"
          title="delete workshop session"
          aria-label="delete workshop session"
        />
      </div>
      <div className={commonStyles.card}>
        <div className={commonStyles.row}>
          {session.format === 'in_person' && (
            <>
              <TextField
                label="Location name"
                name="location name"
                size="s"
                className={classNames(commonStyles.item, commonStyles.required)}
                onChange={e => {
                  handleSession({...session, locationName: e.target.value});
                }}
                value={session.locationName}
              />
              <TextField
                label="Location address"
                name="location address"
                size="s"
                className={classNames(commonStyles.item, commonStyles.required)}
                onChange={e => {
                  handleSession({...session, locationAddress: e.target.value});
                }}
                value={session.locationAddress}
              />
            </>
          )}
          {session.format === 'virtual' && (
            <>
              <TextField
                label="Meeting link"
                name="meeting link"
                size="s"
                className={classNames(commonStyles.item, commonStyles.required)}
                onChange={e => {
                  handleSession({...session, meetingLink: e.target.value});
                }}
                value={session.meetingLink}
              />
              {/* blank space */}
              <div className={commonStyles.item} />
            </>
          )}
        </div>
        {showSameAsPrevious && (
          <div className={styles.copyPreviousCheckbox}>
            <Checkbox
              label={`${sameAsPreviousLabel} same as previous`}
              name={`${sameAsPreviousLabel} same as previous`}
              checked={session.sameAsPrevious}
              size="s"
              onChange={e => handleSameAsPrevious(e.target.checked)}
            />
          </div>
        )}
      </div>
    </>
  );
};
