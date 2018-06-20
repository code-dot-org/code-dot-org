import React, {Component, PropTypes} from 'react';
import StudentsAssessmentsMCTable, {studentOverviewDataPropType} from './StudentsAssessmentsMCTable';
import {
  getStudentsMCSummaryForCurrentAssessment,
} from './sectionAssessmentsRedux';
import {connect} from 'react-redux';

class StudentsMCSummaryContainer extends Component {
  static propTypes = {
    studentOverviewData: PropTypes.arrayOf(studentOverviewDataPropType),
  };

  render() {
    return (
      <div>
        {/* TODO(NO): Temporary placeholder for the header of the table */}
        <h2>Students MC Summary Container </h2>
        <StudentsAssessmentsMCTable
          studentOverviewData={this.props.studentOverviewData}
        />
      </div>
    );
  }
}

export const UnconnectedStudentsMCSummaryContainer = StudentsMCSummaryContainer;

export default connect(state => ({
  studentOverviewData: getStudentsMCSummaryForCurrentAssessment(state),
}))(StudentsMCSummaryContainer);
