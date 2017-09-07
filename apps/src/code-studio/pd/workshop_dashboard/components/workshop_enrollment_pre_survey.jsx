import React from 'react';
import _ from 'lodash';
import {Table} from 'react-bootstrap';
import {Chart} from "react-google-charts";
import {workshopEnrollmentStyles} from "../workshop_enrollment_styles";
import {enrollmentShape} from "../types";

const styles = {
  ...workshopEnrollmentStyles,
  containerDiv: {
    overflowY: "hidden"
  }
};

export default class WorkshopEnrollmentPreSurvey extends React.Component {
  constructor(props) {
    super(props);

    const attendeeCountByUnitLesson = _.countBy(
      this.props.enrollments.filter(e => e.pre_workshop_survey && e.pre_workshop_survey.unitLessonShortName),
      e => e.pre_workshop_survey.unitLessonShortName
    );

    const data = [];
    for (const unitLesson in attendeeCountByUnitLesson) {
      data.push([unitLesson, attendeeCountByUnitLesson[unitLesson]]);
    }
    this.chartData = _.sortBy(data, row => row[0]);
    this.chartData.unshift(["Unit and Lesson", "# of Attendees"]);
  }

  render() {
    return (
      <div style={styles.containerDiv}>
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
        {this.chartData.length > 1 &&
          <Chart
            chartType="ColumnChart"
            data={this.chartData}
            options={{
              title: "# of Attendees Teaching Each Lesson",
              legend: {position: "none"},
              hAxis: {title: "Units and Lessons"},
              vAxis: {title: "# of Attendees"}
            }}
          />
        }
      </div>
    );
  }
}

WorkshopEnrollmentPreSurvey.propTypes = {
  enrollments: React.PropTypes.arrayOf(enrollmentShape).isRequired
};
