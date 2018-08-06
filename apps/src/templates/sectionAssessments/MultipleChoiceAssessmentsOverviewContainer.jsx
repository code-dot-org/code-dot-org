import React, {Component, PropTypes} from 'react';
import MultipleChoiceAssessmentsOverviewTable from './MultipleChoiceAssessmentsOverviewTable';
import {
  getMultipleChoiceSectionSummary,
  countSubmissionsForCurrentAssessment,
  ALL_STUDENT_FILTER,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';
import { multipleChoiceDataPropType } from './assessmentDataShapes';
import i18n from "@cdo/locale";
import {getTotalStudentCount} from '@cdo/apps/redux/sectionDataRedux';

class MultipleChoiceAssessmentsOverviewContainer extends Component {
  static propTypes= {
    questionAnswerData: PropTypes.arrayOf(multipleChoiceDataPropType),
    totalStudentCount: PropTypes.number,
    totalStudentSubmissions: PropTypes.number,
    studentId: PropTypes.number,
    openDialog: PropTypes.func.isRequired,
  };

  render() {
    const {questionAnswerData, totalStudentCount, totalStudentSubmissions, studentId} = this.props;
    return (
      <div>
        {(questionAnswerData.length > 0 && studentId === ALL_STUDENT_FILTER) &&
          <div>
            <h2>
              {i18n.multipleChoiceQuestionsOverview({
                numSubmissions: totalStudentSubmissions,
                numStudents: totalStudentCount
              })}
            </h2>
            <MultipleChoiceAssessmentsOverviewTable
              questionAnswerData={questionAnswerData}
              openDialog={this.props.openDialog}
            />
          </div>
        }
      </div>
    );
  }
}

export const UnconnectedMultipleChoiceAssessmentsOverviewContainer = MultipleChoiceAssessmentsOverviewContainer;

export default connect(state => ({
  questionAnswerData: getMultipleChoiceSectionSummary(state),
  totalStudentSubmissions: countSubmissionsForCurrentAssessment(state),
  totalStudentCount: getTotalStudentCount(state),
  studentId: state.sectionAssessments.studentId,
}))(MultipleChoiceAssessmentsOverviewContainer);
