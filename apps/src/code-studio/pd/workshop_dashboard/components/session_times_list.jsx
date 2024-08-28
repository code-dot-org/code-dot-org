/**
 * Displays a list of nicely-formatted session times for a workshop.
 */
import PropTypes from 'prop-types';
import React from 'react';

import SessionTime from './session_time';

export default class SessionTimesList extends React.Component {
  static propTypes = {
    sessions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
      })
    ).isRequired,
  };

  render() {
    const listItems = this.props.sessions.map(session => {
      return (
        <li key={session.id} style={{whiteSpace: 'nowrap'}}>
          <SessionTime session={session} />
        </li>
      );
    });

    return <ul className="unstyled">{listItems}</ul>;
  }
}
