/**
 * Displays nicely-formatted session time for a workshop.
 */
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';

import {TIME_FORMAT, DATETIME_FORMAT} from '../workshopConstants';

export default class SessionTime extends React.Component {
  static propTypes = {
    session: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
      time_zone: PropTypes.string,
    }).isRequired,
  };

  render() {
    const {session} = this.props;
    const tzAbbreviation = session.time_zone
      ? moment.utc(session.start).tz(session.time_zone).format('z')
      : 'local';
    const formattedTime = `${moment
      .utc(session.start)
      .tz(session.time_zone || 'UTC')
      .format(DATETIME_FORMAT)}-${moment
      .utc(session.end)
      .tz(session.time_zone || 'UTC')
      .format(TIME_FORMAT)} ${tzAbbreviation}`;

    return <div>{formattedTime}</div>;
  }
}
