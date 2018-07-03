import React, {Component, PropTypes} from 'react';
import MultipleChoiceAssessmentsOverviewTable from './MultipleChoiceAssessmentsOverviewTable';
import {
  getMultipleChoiceSectionSummary,
  countSubmissionsForCurrentAssessment,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';
import { multipleChoiceDataPropType } from './assessmentDataShapes';
import i18n from "@cdo/locale";
import {getTotalStudentCount} from '@cdo/apps/redux/sectionDataRedux';

class MCAssessmentsOverviewContainer extends Component {
  static propTypes= {
    questionAnswerData: PropTypes.arrayOf(multipleChoiceDataPropType),
    totalStudentCount: PropTypes.number,
    totalStudentSubmissions: PropTypes.number,
  };

  render() {
    const {questionAnswerData, totalStudentCount, totalStudentSubmissions} = this.props;
    return (
      <div>
        {questionAnswerData.length > 0 &&
          <div>
            <h2>
              {i18n.multipleChoiceQuestionsOverview({
                numSubmissions: totalStudentSubmissions,
                numStudents: totalStudentCount
              })}
            </h2>
            <MultipleChoiceAssessmentsOverviewTable
              questionAnswerData={questionAnswerData}
            />
          </div>
        }
      </div>
    );
  }
}

export const UnconnectedMCAssessmentsOverviewContainer = MCAssessmentsOverviewContainer;

export default connect(state => ({
  questionAnswerData: getMultipleChoiceSectionSummary(state),
  totalStudentSubmissions: countSubmissionsForCurrentAssessment(state),
  totalStudentCount: getTotalStudentCount(state),
}))(MCAssessmentsOverviewContainer);
