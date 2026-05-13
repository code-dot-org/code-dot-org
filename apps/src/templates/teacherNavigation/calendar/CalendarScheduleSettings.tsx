import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  IconButton,
  Typography as MuiTypography,
} from '@mui/material';
import moment from 'moment';
import React from 'react';

import DatePicker from '@cdo/apps/sharedComponents/DatePicker';
import i18n from '@cdo/locale';

import {
  CalendarPlanOneOffSession,
  CalendarPlanRecurringSession,
  SectionCalendarPlan,
} from './calendarPlanTypes';

import styles from './calendar.module.scss';

interface CalendarScheduleSettingsProps {
  plan: SectionCalendarPlan;
  onPlanChange: (plan: SectionCalendarPlan) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
}

const WEEKDAYS = [
  {value: '0', text: i18n.sunday()},
  {value: '1', text: i18n.monday()},
  {value: '2', text: i18n.tuesday()},
  {value: '3', text: i18n.wednesday()},
  {value: '4', text: i18n.thursday()},
  {value: '5', text: i18n.friday()},
  {value: '6', text: i18n.saturday()},
];

function newClientId(prefix: string) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatDate(value: Date | null) {
  return value ? moment(value).format('YYYY-MM-DD') : null;
}

function toDate(value: string | null) {
  return value ? moment(value, 'YYYY-MM-DD').toDate() : null;
}

const CalendarScheduleSettings: React.FC<CalendarScheduleSettingsProps> = ({
  plan,
  onPlanChange,
  onSave,
  onReset,
  isSaving,
}) => {
  const updateRecurringSession = (
    index: number,
    changes: Partial<CalendarPlanRecurringSession>
  ) => {
    const recurringSessions = plan.recurringSessions.slice();
    recurringSessions[index] = {...recurringSessions[index], ...changes};
    onPlanChange({...plan, mode: 'detailed_sessions', recurringSessions});
  };

  const updateOneOffSession = (
    index: number,
    changes: Partial<CalendarPlanOneOffSession>
  ) => {
    const oneOffSessions = plan.oneOffSessions.slice();
    oneOffSessions[index] = {...oneOffSessions[index], ...changes};
    onPlanChange({...plan, mode: 'detailed_sessions', oneOffSessions});
  };

  return (
    <div className={styles.scheduleSettings}>
      <div className={styles.settingsHeader}>
        <MuiTypography variant="body2" component="h2">
          {i18n.calendarScheduleSettings()}
        </MuiTypography>
        <MuiButton
          size="small"
          variant="contained"
          startIcon={<FontAwesomeV6Icon iconName="floppy-disk" />}
          onClick={onSave}
          disabled={isSaving}
        >
          {i18n.save()}
        </MuiButton>
        <MuiButton
          size="small"
          variant="outlined"
          startIcon={<FontAwesomeV6Icon iconName="rotate-left" />}
          onClick={onReset}
        >
          {i18n.reset()}
        </MuiButton>
      </div>
      <label className={styles.dateTimeField}>
        <MuiTypography variant="body4" component="span">
          {i18n.unitStartDate()}
        </MuiTypography>
        <DatePicker
          date={toDate(plan.startDate)}
          clearable
          onChange={(value: Date | null) =>
            onPlanChange({
              ...plan,
              mode: 'detailed_sessions',
              startDate: formatDate(value),
            })
          }
        />
      </label>
      <div className={styles.sessionSection}>
        <div className={styles.settingsHeader}>
          <MuiTypography variant="body3" component="h3">
            {i18n.recurringClassSessions()}
          </MuiTypography>
          <MuiButton
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeV6Icon iconName="plus" />}
            onClick={() =>
              onPlanChange({
                ...plan,
                mode: 'detailed_sessions',
                recurringSessions: [
                  ...plan.recurringSessions,
                  {
                    clientId: newClientId('recurring'),
                    weekday: 2,
                    startTime: '11:00',
                    durationMinutes: 45,
                    position: plan.recurringSessions.length,
                    active: true,
                  },
                ],
              })
            }
          >
            {i18n.add()}
          </MuiButton>
        </div>
        {plan.recurringSessions.map((session, index) => (
          <div className={styles.sessionRow} key={session.clientId}>
            <SimpleDropdown
              name={`weekday-${session.clientId}`}
              items={WEEKDAYS}
              selectedValue={session.weekday.toString()}
              onChange={event =>
                updateRecurringSession(index, {
                  weekday: parseInt(event.target.value),
                })
              }
              size="s"
              labelText={i18n.day()}
            />
            <label className={styles.dateTimeField}>
              <MuiTypography variant="body4" component="span">
                {i18n.startTime()}
              </MuiTypography>
              <input
                className={styles.timeInput}
                type="time"
                value={session.startTime}
                onChange={event =>
                  updateRecurringSession(index, {
                    startTime: event.target.value || '09:00',
                  })
                }
              />
            </label>
            <SimpleDropdown
              name={`duration-${session.clientId}`}
              items={[30, 45, 60, 75, 90].map(value => ({
                value: value.toString(),
                text: i18n.minutesLabel({number: value}),
              }))}
              selectedValue={session.durationMinutes.toString()}
              onChange={event =>
                updateRecurringSession(index, {
                  durationMinutes: parseInt(event.target.value),
                })
              }
              size="s"
              labelText={i18n.duration()}
            />
            <IconButton
              size="small"
              aria-label={i18n.remove()}
              onClick={() =>
                onPlanChange({
                  ...plan,
                  recurringSessions: plan.recurringSessions.filter(
                    item => item.clientId !== session.clientId
                  ),
                })
              }
            >
              <FontAwesomeV6Icon iconName="trash" />
            </IconButton>
          </div>
        ))}
      </div>
      <div className={styles.sessionSection}>
        <div className={styles.settingsHeader}>
          <MuiTypography variant="body3" component="h3">
            {i18n.oneOffClassSessions()}
          </MuiTypography>
          <MuiButton
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeV6Icon iconName="plus" />}
            onClick={() =>
              onPlanChange({
                ...plan,
                mode: 'detailed_sessions',
                oneOffSessions: [
                  ...plan.oneOffSessions,
                  {
                    clientId: newClientId('one-off'),
                    sessionDate:
                      plan.startDate || moment().format('YYYY-MM-DD'),
                    startTime: '09:30',
                    durationMinutes: 30,
                    position: plan.oneOffSessions.length,
                  },
                ],
              })
            }
          >
            {i18n.add()}
          </MuiButton>
        </div>
        {plan.oneOffSessions.map((session, index) => (
          <div className={styles.sessionRow} key={session.clientId}>
            <label className={styles.dateTimeField}>
              <MuiTypography variant="body4" component="span">
                {i18n.date()}
              </MuiTypography>
              <DatePicker
                date={toDate(session.sessionDate)}
                onChange={(value: Date | null) =>
                  updateOneOffSession(index, {
                    sessionDate: formatDate(value) || session.sessionDate,
                  })
                }
              />
            </label>
            <label className={styles.dateTimeField}>
              <MuiTypography variant="body4" component="span">
                {i18n.startTime()}
              </MuiTypography>
              <input
                className={styles.timeInput}
                type="time"
                value={session.startTime}
                onChange={event =>
                  updateOneOffSession(index, {
                    startTime: event.target.value || '09:00',
                  })
                }
              />
            </label>
            <SimpleDropdown
              name={`one-off-duration-${session.clientId}`}
              items={[30, 45, 60, 75, 90].map(value => ({
                value: value.toString(),
                text: i18n.minutesLabel({number: value}),
              }))}
              selectedValue={session.durationMinutes.toString()}
              onChange={event =>
                updateOneOffSession(index, {
                  durationMinutes: parseInt(event.target.value),
                })
              }
              size="s"
              labelText={i18n.duration()}
            />
            <IconButton
              size="small"
              aria-label={i18n.remove()}
              onClick={() =>
                onPlanChange({
                  ...plan,
                  oneOffSessions: plan.oneOffSessions.filter(
                    item => item.clientId !== session.clientId
                  ),
                })
              }
            >
              <FontAwesomeV6Icon iconName="trash" />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarScheduleSettings;
