import React from 'react';
import {Table} from 'react-bootstrap';
import {workshopEnrollmentStyles as styles} from "../workshop_enrollment_styles";
import {enrollmentShape} from "../types";

export default class WorkshopEnrollmentPreSurvey extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Table condensed striped>
        <thead>
        <tr>
          <th style={styles.th}>#</th>
          <th style={styles.th}>First Name</th>
          <th style={styles.th}>Last Name</th>
          <th style={styles.th}>Email</th>
          <th style={styles.th}>Current Unit</th>
          <th style={styles.th}>Current Lesson</th>
          <th style={styles.th}>Questions and topics they hope to discuss</th>
        </tr>
        </thead>
        <tbody>
        {
          this.props.enrollments.map((enrollment, i) => {
            const survey = enrollment.pre_workshop_survey;
            return (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{enrollment.first_name}</td>
                <td>{enrollment.last_name}</td>
                <td>{enrollment.email}</td>
                <td>
                  {(survey && survey.unit) ? survey.unit : "No response"}
                </td>
                <td>
                  {(survey && survey.lesson) ? survey.lesson : "No response"}
                </td>
                <td>
                  {(survey && survey.questionsAndTopics) ? survey.questionsAndTopics : "No response"}
                </td>
              </tr>
            );
          })
        }
        </tbody>
      </Table>
    );
  }
}

WorkshopEnrollmentPreSurvey.propTypes = {
  enrollments: React.PropTypes.arrayOf(enrollmentShape).isRequired
};
