import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import moment from 'moment-timezone';
import React, {ChangeEvent, Dispatch, FC, useCallback, useMemo} from 'react';

import {PdSessionFormats} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {DATE_FORMAT, TIME_FORMAT} from '../../../workshopConstants';
import {SessionAction, SessionFormState} from '../../types';

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

export const SessionPart: FC<{
  id: SessionFormState['id'];
  date: SessionFormState['date'];
  start: SessionFormState['start'];
  end: SessionFormState['end'];
  format: SessionFormState['format'];
  locationName: SessionFormState['locationName'];
  locationAddress: SessionFormState['locationAddress'];
  meetingLink: SessionFormState['meetingLink'];
  sameAsPrevious: SessionFormState['sameAsPrevious'];
  showSameAsPrevious: boolean;
  dispatchSessions: Dispatch<SessionAction>;
}> = ({
  id,
  date,
  start,
  end,
  format,
  locationName,
  locationAddress,
  meetingLink,
  sameAsPrevious,
  showSameAsPrevious,
  dispatchSessions,
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
    switch (format) {
      case 'in_person':
        return 'Location';
      case 'virtual':
        return 'Meeting link';
      default:
        return '';
    }
  }, [format]);

  const handleSession = useCallback(
    (update: Partial<SessionFormState>) => {
      dispatchSessions({type: 'UPDATE_SESSION', id, payload: update});
    },
    [dispatchSessions, id]
  );

  const deleteSession = useCallback(() => {
    dispatchSessions({type: 'DELETE_SESSION', id});
  }, [dispatchSessions, id]);

  const handleSameAsPrevious = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        dispatchSessions({
          type: 'UPDATE_SESSION_SAME_AS_PREVIOUS',
          id,
        });
      } else {
        handleSession({sameAsPrevious: false});
      }
    },
    [dispatchSessions, handleSession, id]
  );

  const updateSession = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const update = {
        [event.target.name]: event.target.value,
      };
      handleSession(update);
    },
    [handleSession]
  );

  return (
    <>
      <div className={classNames(commonStyles.row, styles.sessionRow)}>
        <TextField
          label="Date"
          name="date"
          inputType="date"
          size="s"
          className={classNames(commonStyles.item, commonStyles.required)}
          value={date}
          onChange={updateSession}
        />
        <SimpleDropdown
          name="start"
          labelText="Start Time"
          onChange={updateSession}
          iconLeft={{iconName: 'clock'}}
          selectedValue={start}
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
          name="end"
          labelText="End Time"
          onChange={updateSession}
          iconLeft={{iconName: 'clock'}}
          selectedValue={end}
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
          onChange={updateSession}
          selectedValue={format}
          items={PdSessionFormats.map(({value, label}) => ({
            value,
            text: label,
          }))}
          dropdownTextThickness="thin"
          size="s"
          className={classNames(commonStyles.item, commonStyles.required)}
        />
        <WithTooltip
          tooltipOverlayClassName={styles.deleteButtonContainer}
          tooltipProps={{
            tooltipId: `delete-session-tooltip-${id}`,
            size: 'xs',
            text: 'delete workshop session',
          }}
        >
          <Button
            icon={{iconName: 'minus'}}
            onClick={deleteSession}
            isIconOnly={true}
            className={styles.deleteButton}
            type="secondary"
            color="destructive"
            title="delete workshop session"
            aria-label="delete workshop session"
            aria-describedby={`delete-session-tooltip-${id}`}
          />
        </WithTooltip>
      </div>
      <div className={commonStyles.card}>
        <div className={commonStyles.row}>
          {format === 'in_person' && (
            <>
              <TextField
                label="Location name"
                name="locationName"
                size="s"
                className={classNames(commonStyles.item, commonStyles.required)}
                onChange={updateSession}
                value={locationName}
              />
              <TextField
                label="Location address"
                name="locationAddress"
                size="s"
                className={classNames(commonStyles.item, commonStyles.required)}
                onChange={updateSession}
                value={locationAddress}
              />
            </>
          )}
          {format === 'virtual' && (
            <>
              <TextField
                label="Meeting link"
                name="meetingLink"
                size="s"
                className={classNames(commonStyles.item, commonStyles.required)}
                onChange={updateSession}
                value={meetingLink}
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
              checked={sameAsPrevious}
              size="s"
              onChange={handleSameAsPrevious}
            />
          </div>
        )}
      </div>
    </>
  );
};
