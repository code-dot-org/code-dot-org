import PropTypes from 'prop-types';
import React, {Component} from 'react';
import MultipleChoiceSurveyOverviewTable from './MultipleChoiceSurveyOverviewTable';
import {multipleChoiceDataPropType} from './assessmentDataShapes';
import {
  getMultipleChoiceSurveyResults,
  countSubmissionsForCurrentAssessment
} from './sectionAssessmentsRedux';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {getTotalStudentCount} from '@cdo/apps/redux/sectionDataRedux';

class MultipleChoiceSurveyOverviewContainer extends Component {
  static propTypes = {
    multipleChoiceSurveyData: PropTypes.arrayOf(multipleChoiceDataPropType),
    totalStudentCount: PropTypes.number,
    totalStudentSubmissions: PropTypes.number
  };

  render() {
    const {
      multipleChoiceSurveyData,
      totalStudentCount,
      totalStudentSubmissions
    } = this.props;
    return (
      <div>
        <h2>
          {i18n.multipleChoiceQuestionsOverview({
            numSubmissions: totalStudentSubmissions,
            numStudents: totalStudentCount
          })}
        </h2>
        {multipleChoiceSurveyData.length > 0 && (
          <MultipleChoiceSurveyOverviewTable
            multipleChoiceSurveyData={multipleChoiceSurveyData}
          />
        )}
      </div>
    );
  }
}

export const UnconnectedMultipleChoiceSurveyOverviewContainer = MultipleChoiceSurveyOverviewContainer;

export default connect(state => ({
  multipleChoiceSurveyData: getMultipleChoiceSurveyResults(state),
  totalStudentSubmissions: countSubmissionsForCurrentAssessment(state),
  totalStudentCount: getTotalStudentCount(state)
}))(MultipleChoiceSurveyOverviewContainer);
