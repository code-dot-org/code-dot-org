/**
 * Displays nicely-formatted session time for a workshop.
*/
import React from 'react';
import moment from 'moment';

const SessionTime = React.createClass({
  propTypes: {
    session: React.PropTypes.shape({
      start: React.PropTypes.string.isRequired,
      end: React.PropTypes.string.isRequired
    }).isRequired
  },

  render() {
    const formattedTime = moment.utc(this.props.session.start).format('MM/DD/YY, h:mmA') +
      '-' + moment.utc(this.props.session.end).format('h:mmA');

    return <div>{formattedTime}</div>;
  }
});
export default SessionTime;
