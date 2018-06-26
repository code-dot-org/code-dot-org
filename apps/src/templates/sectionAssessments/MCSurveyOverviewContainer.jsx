import React, {Component, PropTypes} from 'react';
import MultipleChoiceSurveyOverviewTable, {multipleChoiceSurveyDataPropType} from './MultipleChoiceSurveyOverviewTable';
import {
  getMultipleChoiceSurveyResults,
  getTotalSubmissionForCurrentAssessment,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';
import i18n from "@cdo/locale";

class MCSurveyOverviewContainer extends Component {
  static propTypes= {
    multipleChoiceSurveyData: PropTypes.arrayOf(multipleChoiceSurveyDataPropType),
    totalStudentCount: PropTypes.number,
    totalStudentSubmissions: PropTypes.number,
  };

  render() {
    const {multipleChoiceSurveyData, totalStudentCount, totalStudentSubmissions} = this.props;
    return (
      <div>
        <h2>
          {i18n.multipleChoiceQuestionsOverview({
            numSubmissions: totalStudentSubmissions,
            numStudents: totalStudentCount
          })}
        </h2>
        {multipleChoiceSurveyData.length > 0 &&
          <MultipleChoiceSurveyOverviewTable
            multipleChoiceSurveyData={multipleChoiceSurveyData}
          />
        }
      </div>
    );
  }
}

export const UnconnectedMCSurveyOverviewContainer = MCSurveyOverviewContainer;

export default connect(state => ({
  multipleChoiceSurveyData: getMultipleChoiceSurveyResults(state),
  totalStudentSubmissions: getTotalSubmissionForCurrentAssessment(state, true),
}))(MCSurveyOverviewContainer);
