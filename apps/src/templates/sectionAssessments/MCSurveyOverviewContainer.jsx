import React, {Component, PropTypes} from 'react';
import MultipleChoiceSurveyOverviewTable, {multipleChoiceSurveyDataPropType} from './MultipleChoiceSurveyOverviewTable';
import {getMultipleChoiceSurveyResults} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';
import i18n from "@cdo/locale";

class MCSurveyOverviewContainer extends Component {
  static propTypes= {
    multipleChoiceSurveyData: PropTypes.arrayOf(multipleChoiceSurveyDataPropType),
    totalStudentCount: PropTypes.number,
  };

  render() {
    const {multipleChoiceSurveyData, totalStudentCount} = this.props;
    return (
      <div>
        <h2>
          {i18n.multipleChoiceQuestionsOverview({numSubmissions: 3, numStudents: totalStudentCount})}
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
}))(MCSurveyOverviewContainer);
