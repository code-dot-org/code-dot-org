import {
  LinkButton,
  Button,
  ButtonProps,
} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyThreeText,
  BodyFourText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {
  getSessionDate,
  getSessionTimes,
} from '@cdo/apps/code-studio/pd/sessionDateUtils';
import {TIME_FORMAT} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

import {WorkshopInfo, SessionInfo} from './../types';

import moduleStyles from './workshopSessionsList.module.scss';

const commonButtonProps: Partial<ButtonProps> = {
  type: 'secondary',
  color: 'gray',
  size: 'xs',
};

const SessionItemVirtualLocationContent = ({
  meetingLink,
  isUserEnrolled = false,
}: {
  meetingLink?: string;
  isUserEnrolled?: boolean;
}) =>
  isUserEnrolled ? (
    <LinkButton
      {...commonButtonProps}
      href={meetingLink}
      target="_blank"
      text="Join Meeting"
      iconLeft={{iconName: 'video'}}
    />
  ) : (
    <>
      <FontAwesomeV6Icon iconName="video" />
      <BodyThreeText>Virtual / Zoom</BodyThreeText>
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
    <BodyThreeText>{locationLabel}</BodyThreeText>
    {isUserEnrolled && (
      <Button
        {...commonButtonProps}
        text="Copy address"
        iconLeft={{iconName: 'copy'}}
        onClick={() => copyToClipboard(locationAddress)}
      />
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
        <BodyThreeText>
          <StrongText>{dateLabel}</StrongText>
        </BodyThreeText>
        <BodyFourText>{timeRange}</BodyFourText>
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
