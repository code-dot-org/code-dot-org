import React, {Component, PropTypes} from 'react';
import SubmissionStatusAssessmentsTable, {studentOverviewDataPropType} from './SubmissionStatusAssessmentsTable';
import {
  getStudentsMCSummaryForCurrentAssessment,
} from './sectionAssessmentsRedux';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";

class SubmissionStatusAssessmentsContainer extends Component {
  static propTypes = {
    studentOverviewData: PropTypes.arrayOf(studentOverviewDataPropType),
  };

  render() {
    return (
      <div>
        <h2>{i18n.studentOverviewTableHeader()}</h2>
        <SubmissionStatusAssessmentsTable
          studentOverviewData={this.props.studentOverviewData}
        />
      </div>
    );
  }
}

export const UnconnectedSubmissionStatusAssessmentsContainer = SubmissionStatusAssessmentsContainer;

export default connect(state => ({
  studentOverviewData: getStudentsMCSummaryForCurrentAssessment(state),
}))(SubmissionStatusAssessmentsContainer);
