/*
  Displays nicely-formatted session time for a workshop.
*/
import React from 'react';
const Table = require('react-bootstrap').Table;

let styles = {
  th: {
    backgroundImage: 'none',
    padding: 0,
    backgroundColor: 'white',
    fontFamily: '"Gotham 4r"',
    fontSize: 14
  }
};

const WorkshopEnrollment = React.createClass({
  propTypes: {
    enrollments: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        email: React.PropTypes.string.isRequired,
        district_name: React.PropTypes.string.isRequired,
        school: React.PropTypes.string.isRequired,
        user_id: React.PropTypes.number
      })
    ).isRequired
  },

  render: function () {
    if (this.props.enrollments.length === 0) {
      let signupUrl = location.origin + "/pd/workshops/" + this.props.workshopId + '/enroll';
      let signupLink = <a href={signupUrl} target="_blank">{signupUrl}</a>;
      return (
        <div>
          No one is currently signed up for your workshop. Share your workshop sign-up
          link {signupLink} for teachers to enroll.
        </div>
      );
    }

    var enrollmentRows = this.props.enrollments.map(function (enrollment, i) {
      return (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{enrollment.name}</td>
          <td>{enrollment.email}</td>
          <td>{enrollment.district_name}</td>
          <td>{enrollment.school}</td>
          <td>{enrollment.user_id ? 'Yes' : 'No'}</td>
        </tr>
      );
    });

    return (
      <Table condensed striped>
        <thead>
        <tr>
          <th style={styles.th}>#</th>
          <th style={styles.th}>Name</th>
          <th style={styles.th}>Email</th>
          <th style={styles.th}>District</th>
          <th style={styles.th}>School</th>
          <th style={styles.th}>Code Studio Account?</th>
        </tr>
        </thead>
        <tbody>
        {enrollmentRows}
        </tbody>
      </Table>
    );
  }
});

module.exports = WorkshopEnrollment;
