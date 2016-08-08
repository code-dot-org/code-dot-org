/**
 * Displays a list of nicely-formatted session times for a workshop.
 */
import React from 'react';
import SessionTime from './session_time';

const SessionTimesList = React.createClass({
  propTypes: {
    sessions: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.number.isRequired
      })
    ).isRequired
  },

  render() {
    const listItems = this.props.sessions.map(session => {
      return (
        <li key={session.id} style={{whiteSpace: 'nowrap'}}>
          <SessionTime session={session}/>
        </li>
      );
    });

    return (
      <ul className="unstyled">
        {listItems}
      </ul>
    );
  }
});
export default SessionTimesList;
