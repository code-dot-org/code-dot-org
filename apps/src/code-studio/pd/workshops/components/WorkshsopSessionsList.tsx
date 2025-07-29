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

import {WorkshopInfo, SessionInfo} from './../types';

import moduleStyles from './workshopSessionsList.module.scss';

const renderSessionsListItem = (session: SessionInfo) => {
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

  const locationLabel = isVirtual
    ? 'Virtual / Zoom'
    : session.location_name
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
        <FontAwesomeV6Icon iconName={isVirtual ? 'video' : 'location-dot'} />
        <BodyThreeText>{locationLabel}</BodyThreeText>
      </div>
    </li>
  );
};
interface WorkshopSessionsListProps extends Pick<WorkshopInfo, 'sessions'> {}

/** Component to render a list of workshop sessions. */
const WorkshopSessionsList: React.FC<WorkshopSessionsListProps> = ({
  sessions,
}) => {
  return (
    <ul className={moduleStyles.workshopSessionsList}>
      {sessions.map(session => renderSessionsListItem(session))}
    </ul>
  );
};

export default WorkshopSessionsList;
