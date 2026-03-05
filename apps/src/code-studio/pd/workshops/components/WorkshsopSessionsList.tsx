import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';

import {
  getSessionDate,
  getSessionTimes,
} from '@cdo/apps/code-studio/pd/sessionDateUtils';
import {TIME_FORMAT} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

import {WorkshopInfo, SessionInfo} from './../types';

import moduleStyles from './workshopSessionsList.module.scss';

const commonButtonProps = {
  variant: 'outlined',
  color: 'tertiary',
  size: 'extraSmall',
} as const;

const SessionItemVirtualLocationContent = ({
  meetingLink,
  isUserEnrolled = false,
}: {
  meetingLink?: string;
  isUserEnrolled?: boolean;
}) =>
  isUserEnrolled ? (
    <MuiButton
      {...commonButtonProps}
      href={meetingLink ?? ''}
      target="_blank"
      rel="noopener noreferrer"
      startIcon={<FontAwesomeV6Icon iconName="video" />}
    >
      {'Join Meeting'}
    </MuiButton>
  ) : (
    <>
      <FontAwesomeV6Icon iconName="video" />
      <Typography variant="body3" gutterBottom>
        Virtual / Zoom
      </Typography>
    </>
  );

const SessionItemInPersonLocationContent = ({
  locationLabel,
  locationAddress = '',
  isUserEnrolled = false,
}: {
  locationLabel: string;
  locationAddress?: string;
  isUserEnrolled?: boolean;
}) => (
  <>
    <FontAwesomeV6Icon iconName="location-dot" />
    <Typography variant="body3" gutterBottom>
      {locationLabel}
    </Typography>
    {isUserEnrolled && (
      <MuiButton
        {...commonButtonProps}
        onClick={() => copyToClipboard(locationAddress)}
        type="button"
        startIcon={<FontAwesomeV6Icon iconName="copy" />}
      >
        {'Copy address'}
      </MuiButton>
    )}
  </>
);

const renderSessionsListItem = (
  session: SessionInfo,
  isUserEnrolled?: boolean
) => {
  const dateLabel = getSessionDate({
    session,
    format: 'MMMM Do, YYYY',
    isLocal: session.is_local,
  });
  const {startTime, endTime, tzAbbreviation} = getSessionTimes({
    session,
    format: TIME_FORMAT,
    isLocal: session.is_local,
  });
  const timeRange = `${startTime} - ${endTime} ${tzAbbreviation}`;

  const isVirtual = session.session_format === 'virtual';

  const locationLabel = session.location_name
    ? `${session.location_name}`
    : 'TBD';

  return (
    <li key={session.id}>
      <div className={moduleStyles.sessionItemTime}>
        <Typography variant="body3" gutterBottom>
          <Typography variant="strong">{dateLabel}</Typography>
        </Typography>
        <Typography variant="body4" gutterBottom>
          {timeRange}
        </Typography>
      </div>
      <div className={moduleStyles.sessionItemLocation}>
        {isVirtual ? (
          <SessionItemVirtualLocationContent
            meetingLink={session.meeting_link}
            isUserEnrolled={isUserEnrolled}
          />
        ) : (
          <SessionItemInPersonLocationContent
            locationLabel={locationLabel}
            isUserEnrolled={isUserEnrolled}
            locationAddress={session.location_address}
          />
        )}
      </div>
    </li>
  );
};
interface WorkshopSessionsListProps extends Pick<WorkshopInfo, 'sessions'> {
  isUserEnrolled?: boolean;
}

/** Component to render a list of workshop sessions. */
const WorkshopSessionsList: React.FC<WorkshopSessionsListProps> = ({
  sessions,
  isUserEnrolled,
}) => {
  return (
    <ul className={moduleStyles.workshopSessionsList}>
      {sessions.map(session => renderSessionsListItem(session, isUserEnrolled))}
    </ul>
  );
};

export default WorkshopSessionsList;
