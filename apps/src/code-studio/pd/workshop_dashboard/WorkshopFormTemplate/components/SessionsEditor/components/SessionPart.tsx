import Button from '@code-dot-org/component-library/button';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {SessionToken} from '@mapbox/search-js-core';
import {useAddressAutofillCore} from '@mapbox/search-js-react';
import classNames from 'classnames';
import moment from 'moment-timezone';
import React, {
  ChangeEvent,
  Dispatch,
  FC,
  memo,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {useSelector} from 'react-redux';

import {PdSessionFormats} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {TIME_FORMAT} from '../../../../workshopConstants';
import {
  SessionFormState,
  SessionFields,
  SessionAction,
  SessionError,
} from '../../../../workshops/types';
import {AutocompleteInput} from '../../AutocompleteInput';

import commonStyles from '../../../styles.module.scss';
import styles from '../styles.module.scss';

export const SessionPart: FC<{
  id: SessionFormState['id'];
  date: SessionFormState['date'];
  start: SessionFormState['start'];
  end: SessionFormState['end'];
  format: SessionFormState['format'];
  locationName: SessionFormState['locationName'];
  locationAddress: SessionFormState['locationAddress'];
  meetingLink: SessionFormState['meetingLink'];
  deleteDisabled: boolean;
  fields: SessionFields;
  errors?: SessionError;
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
  deleteDisabled,
  fields,
  errors,
  dispatchSessions,
}) => {
  const sessionToken = useRef<SessionToken>(new SessionToken());
  const listboxId = sessionToken.current.id;
  const accessToken = useSelector(
    ({mapbox: {mapboxAccessToken}}: {mapbox: {mapboxAccessToken: string}}) =>
      mapboxAccessToken
  );
  const autofill = useAddressAutofillCore({accessToken});

  const timeOptions = useMemo(() => {
    const startTime = moment().startOf('day').add(7, 'hours');
    const endTime = moment().startOf('day').add(22, 'hours');
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

  const handleSession = useCallback(
    (update: Partial<SessionFormState>) => {
      dispatchSessions({type: 'UPDATE_SESSION', id, payload: update});
    },
    [dispatchSessions, id]
  );

  const deleteSession = useCallback(() => {
    dispatchSessions({type: 'DELETE_SESSION', id});
  }, [dispatchSessions, id]);

  const updateSession = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const update = {
        [event.target.name]: event.target.value,
      };
      handleSession(update);
    },
    [handleSession]
  );

  const fetchOptions = useCallback(
    async (searchText: string) => {
      const {suggestions} = await autofill.suggest(searchText, {
        sessionToken: sessionToken.current,
      });
      return suggestions
        .map(suggestion => suggestion.full_address)
        .filter(
          (s?: string): s is string => typeof s === 'string' && s.length > 0
        );
    },
    [autofill]
  );

  const showAdditionalFields = useMemo(
    () =>
      Boolean(
        fields.location_name || fields.location_address || fields.meeting_link
      ),
    [fields]
  );

  return (
    <div>
      <div className={classNames(commonStyles.row, styles.sessionRow)}>
        <TextField
          label={fields.date.label}
          name={fields.date.stateKey}
          inputType="date"
          size="s"
          className={classNames(
            commonStyles.item,
            commonStyles.textField,
            commonStyles.required
          )}
          value={date}
          onChange={updateSession}
          errorMessage={errors?.date}
        />
        <SimpleDropdown
          name={fields.start.stateKey}
          labelText={fields.start.label}
          onChange={updateSession}
          iconLeft={{iconName: 'clock'}}
          selectedValue={start}
          items={timeOptions}
          dropdownTextThickness="thin"
          size="s"
          className={classNames(
            commonStyles.item,
            commonStyles.simpleDropdown,
            styles.timeDropdown,
            commonStyles.required
          )}
          errorMessage={errors?.start}
        />
        <SimpleDropdown
          name={fields.end.stateKey}
          labelText={fields.end.label}
          onChange={updateSession}
          iconLeft={{iconName: 'clock'}}
          selectedValue={end}
          items={timeOptions}
          dropdownTextThickness="thin"
          size="s"
          className={classNames(
            commonStyles.item,
            commonStyles.simpleDropdown,
            styles.timeDropdown,
            commonStyles.required
          )}
          errorMessage={errors?.end}
        />
        <SimpleDropdown
          name={fields.session_format.stateKey}
          labelText={fields.session_format.label}
          onChange={updateSession}
          selectedValue={format}
          items={PdSessionFormats.map(({value, label}) => ({
            value,
            text: label,
          }))}
          dropdownTextThickness="thin"
          size="s"
          className={classNames(
            commonStyles.item,
            commonStyles.simpleDropdown,

            commonStyles.required
          )}
          errorMessage={errors?.format}
        />
        <WithTooltip
          tooltipOverlayClassName={styles.deleteButtonContainer}
          tooltipProps={{
            tooltipId: `delete-session-tooltip-${id}`,
            size: 'xs',
            text: 'Delete workshop session',
          }}
        >
          <Button
            icon={{iconName: 'minus'}}
            onClick={deleteSession}
            disabled={deleteDisabled}
            size="s"
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
      {showAdditionalFields && (
        <div className={commonStyles.card}>
          <div className={commonStyles.row}>
            {format === 'in_person' &&
              fields.location_name &&
              fields.location_address && (
                <>
                  <TextField
                    label={fields.location_name.label}
                    name={fields.location_name.stateKey}
                    size="s"
                    className={classNames(
                      commonStyles.item,
                      commonStyles.textField
                    )}
                    onChange={updateSession}
                    value={locationName}
                    errorMessage={errors?.locationName}
                  />
                  <AutocompleteInput
                    id={listboxId}
                    label={fields.location_address.label}
                    name={fields.location_address.stateKey}
                    size="s"
                    placeholder="Enter a location to see results"
                    className={classNames(
                      commonStyles.item,
                      commonStyles.textField
                    )}
                    onChange={updateSession}
                    fetchOptions={fetchOptions}
                    value={locationAddress}
                    errorMessage={errors?.locationAddress}
                  />
                </>
              )}
            {format === 'virtual' && fields.meeting_link && (
              <>
                <TextField
                  label={fields.meeting_link.label}
                  name={fields.meeting_link.stateKey}
                  size="s"
                  className={classNames(
                    commonStyles.item,
                    commonStyles.textField
                  )}
                  onChange={updateSession}
                  value={meetingLink}
                  errorMessage={errors?.meetingLink}
                />
                {/* blank space */}
                <div className={commonStyles.item} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SessionPart);
