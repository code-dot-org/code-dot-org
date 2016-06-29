/*
  Displays a list of nicely-formatted session times for a workshop.
 */
import React from 'react';
var SessionTime = require('./session_time');

var SessionTimesList = React.createClass({
  propTypes: {
    sessions: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.number.isRequired
      })
    ).isRequired
  },

  render: function () {
    var listItems = this.props.sessions.map(function (session) {
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
module.exports = SessionTimesList;
