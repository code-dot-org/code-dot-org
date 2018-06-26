import React, {Component, PropTypes} from 'react';
import StudentsAssessmentsMCTable, {studentOverviewDataPropType} from './StudentsAssessmentsMCTable';
import {
  getStudentsMCSummaryForCurrentAssessment,
} from './sectionAssessmentsRedux';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";

class StudentsMCSummaryContainer extends Component {
  static propTypes = {
    studentOverviewData: PropTypes.arrayOf(studentOverviewDataPropType),
  };

  render() {
    return (
      <div>
        <h2>{i18n.studentOverviewTableHeader()}</h2>
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
