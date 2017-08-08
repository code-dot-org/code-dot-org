/**
 * Displays a list of nicely-formatted session times for a workshop.
 */
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import SessionTime from './session_time';

const SessionTimesList = createReactClass({
  propTypes: {
    sessions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired
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
