import React, {Component, PropTypes} from 'react';
import MultipleChoiceSurveyOverviewTable, {multipleChoiceSurveyDataPropType} from './MultipleChoiceSurveyOverviewTable';
import {getMultipleChoiceSurveyResults, checkCurrentIsSurvey} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';

class MCSurveyOverviewContainer extends Component {
  static propTypes= {
    multipleChoiceSurveyData: PropTypes.arrayOf(multipleChoiceSurveyDataPropType),
  };

  // In my selector, chheck if key is in survey. if yes, continue with survey or else return empty table.

  render() {
    const {multipleChoiceSurveyData} = this.props;
    return (
      <div>
        <h2>{i18n.multipleChoiceQuestionsOverview()}</h2>
        {/* {multipleChoiceSurveyData.length ? <> : 'display text message'} */}
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
  // multipleChoiceSurveyData: checkCurrentIsSurvey(state),
}))(MCSurveyOverviewContainer);
