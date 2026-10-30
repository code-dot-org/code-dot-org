/**
 * Displays nicely-formatted session time for a workshop.
 */
import PropTypes from 'prop-types';
import React from 'react';

import {getSessionDate, getSessionTimes} from '../../sessionDateUtils';
import {DATE_FORMAT, TIME_FORMAT} from '../workshopConstants';

export default class SessionTime extends React.Component {
  static propTypes = {
    session: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
      is_local: PropTypes.bool.isRequired,
    }).isRequired,
  };

  render() {
    const {session} = this.props;
    const date = getSessionDate({
      session,
      format: DATE_FORMAT,
      isLocal: session.is_local,
    });
    const {startTime, endTime, tzAbbreviation} = getSessionTimes({
      session,
      format: TIME_FORMAT,
      isLocal: session.is_local,
    });
    const formattedTime = `${date} ${startTime}-${endTime} ${tzAbbreviation}`;

    return <div>{formattedTime}</div>;
  }
}
