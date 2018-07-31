import React, {Component, PropTypes} from 'react';
import MultipleChoiceSurveyOverviewTable, {multipleChoiceSurveyDataPropType} from './MultipleChoiceSurveyOverviewTable';
import {
  getMultipleChoiceSurveyResults,
  countSubmissionsForCurrentAssessment,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';
import i18n from "@cdo/locale";
import {getTotalStudentCount} from '@cdo/apps/redux/sectionDataRedux';

class MultipleChoiceSurveyOverviewContainer extends Component {
  static propTypes= {
    multipleChoiceSurveyData: PropTypes.arrayOf(multipleChoiceSurveyDataPropType),
    totalStudentCount: PropTypes.number,
    totalStudentSubmissions: PropTypes.number,
    openDialog: PropTypes.func.isRequired,
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
            openDialog={this.props.openDialog}
          />
        }
      </div>
    );
  }
}

export const UnconnectedMultipleChoiceSurveyOverviewContainer = MultipleChoiceSurveyOverviewContainer;

export default connect(state => ({
  multipleChoiceSurveyData: getMultipleChoiceSurveyResults(state),
  totalStudentSubmissions: countSubmissionsForCurrentAssessment(state),
  totalStudentCount: getTotalStudentCount(state),
}))(MultipleChoiceSurveyOverviewContainer);
