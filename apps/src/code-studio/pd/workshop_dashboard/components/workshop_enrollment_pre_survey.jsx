import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {Table} from 'react-bootstrap';
import {Chart} from 'react-google-charts';
import {workshopEnrollmentStyles} from '../workshop_enrollment_styles';
import {enrollmentShape} from '../types';

export default class WorkshopEnrollmentPreSurvey extends React.Component {
  constructor(props) {
    super(props);

    const attendeeCountByUnitLesson = _.countBy(
      this.props.enrollments.filter(
        e => e.pre_workshop_survey && e.pre_workshop_survey.unitLessonShortName
      ),
      e => e.pre_workshop_survey.unitLessonShortName
    );

    const data = [];
    for (const unitLesson in attendeeCountByUnitLesson) {
      data.push([unitLesson, attendeeCountByUnitLesson[unitLesson]]);
    }
    this.chartData = _.sortBy(data, row =>
      this.getSortableUnitLessonShortName(row[0])
    );
    this.chartData.unshift(['Unit and Lesson', '# of Attendees']);
  }

  /**
   * Inserts leading zeros to the unit and lesson, to make sure unitLessonShortNames sort correctly
   * @param unitLessonShortName {string}
   * @returns {string} unitLessonShortName with added zeros
   * @example "U1 L1" -> "U0001 L0001", "U1 L10" -> "U0001 L0010"
   */
  getSortableUnitLessonShortName = unitLessonShortName => {
    const match = /U(\d+) L(\d+)/.exec(unitLessonShortName);
    if (!match) {
      return '';
    }
    return `U${this.padIntStringWithZeros(
      match[1]
    )} L${this.padIntStringWithZeros(match[2])}`;
  };

  /**
   * Returns a copy of the supplied integer string with up to 3 leading zeros added
   * @param intString {string} string representing an integer
   * @returns {string} the number from intString with up to 3 leading zeros
   * @example "1" -> "0001", "12" -> "0012", "123" -> "0123"
   */
  padIntStringWithZeros = intString => {
    const parsedInt = Number.parseInt(intString, 10) || 0;
    return ('0000' + parsedInt).substr(-4, 4);
  };

  render() {
    return (
      <div style={styles.containerDiv}>
        <Table condensed striped>
          <caption>
            {`On the pre-survey, attendees indicate where they predict they will be in the curriculum on ${
              this.props.workshopDate
            }.`}
          </caption>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>First Name</th>
              <th style={styles.th}>Last Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Predicted Unit</th>
              <th style={styles.th}>Predicted Lesson</th>
              <th style={styles.th}>
                Questions and topics they hope to discuss
              </th>
            </tr>
          </thead>
          <tbody>
            {this.props.enrollments.map((enrollment, i) => {
              const survey = enrollment.pre_workshop_survey;
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{enrollment.first_name}</td>
                  <td>{enrollment.last_name}</td>
                  <td>{enrollment.email}</td>
                  <td>{survey && survey.unit ? survey.unit : 'No response'}</td>
                  <td>
                    {survey && survey.lesson ? survey.lesson : 'No response'}
                  </td>
                  <td>
                    {survey && survey.questionsAndTopics
                      ? survey.questionsAndTopics
                      : 'No response'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {this.chartData.length > 1 && (
          <Chart
            chartType="ColumnChart"
            data={this.chartData}
            options={{
              title: '# of Attendees Teaching Each Lesson',
              legend: {position: 'none'},
              hAxis: {title: 'Units and Lessons'},
              vAxis: {title: '# of Attendees'}
            }}
          />
        )}
      </div>
    );
  }
}

const styles = {
  ...workshopEnrollmentStyles,
  containerDiv: {
    overflowY: 'hidden'
  }
};

WorkshopEnrollmentPreSurvey.propTypes = {
  enrollments: PropTypes.arrayOf(enrollmentShape).isRequired,
  workshopDate: PropTypes.string.isRequired
};
