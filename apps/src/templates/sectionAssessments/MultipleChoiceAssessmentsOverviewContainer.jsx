import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {multipleChoiceDataPropType} from './assessmentDataShapes';
import MultipleChoiceAssessmentsOverviewTable from './MultipleChoiceAssessmentsOverviewTable';
import {
  getMultipleChoiceSectionSummary,
  countSubmissionsForCurrentAssessment,
  ALL_STUDENT_FILTER,
} from './sectionAssessmentsRedux';

class MultipleChoiceAssessmentsOverviewContainer extends Component {
  static propTypes = {
    questionAnswerData: PropTypes.arrayOf(multipleChoiceDataPropType),
    totalStudentCount: PropTypes.number,
    totalStudentSubmissions: PropTypes.number,
    studentId: PropTypes.number,
    openDialog: PropTypes.func.isRequired,
  };

  render() {
    const {
      questionAnswerData,
      totalStudentCount,
      totalStudentSubmissions,
      studentId,
    } = this.props;
    return (
      <div>
        {questionAnswerData.length > 0 && studentId === ALL_STUDENT_FILTER && (
          <div>
            <Typography variant="h2" component="h2" gutterBottom>
              {i18n.multipleChoiceQuestionsOverview({
                numSubmissions: totalStudentSubmissions,
                numStudents: totalStudentCount,
              })}
            </Typography>
            <MultipleChoiceAssessmentsOverviewTable
              questionAnswerData={questionAnswerData}
              openDialog={this.props.openDialog}
            />
          </div>
        )}
      </div>
    );
  }
}

export const UnconnectedMultipleChoiceAssessmentsOverviewContainer =
  MultipleChoiceAssessmentsOverviewContainer;

export default connect(state => ({
  questionAnswerData: getMultipleChoiceSectionSummary(state),
  totalStudentSubmissions: countSubmissionsForCurrentAssessment(state),
  totalStudentCount: state.teacherSections.selectedStudents.length,
  studentId: state.sectionAssessments.studentId,
}))(MultipleChoiceAssessmentsOverviewContainer);
