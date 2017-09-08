/**
 * Displays nicely-formatted session time for a workshop.
*/
import React, {PropTypes} from 'react';
import moment from 'moment';
import {
  TIME_FORMAT,
  DATETIME_FORMAT
} from '../workshopConstants';

export default class SessionTime extends React.Component {
  static propTypes = {
    session: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired
    }).isRequired
  };

  render() {
    const formattedTime = moment.utc(this.props.session.start).format(DATETIME_FORMAT) +
      '-' + moment.utc(this.props.session.end).format(TIME_FORMAT);

    return <div>{formattedTime}</div>;
  }
}
