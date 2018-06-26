import React, {Component, PropTypes} from 'react';
import MultipleChoiceSurveyOverviewTable, {multipleChoiceSurveyDataPropType} from './MultipleChoiceSurveyOverviewTable';
import {getMultipleChoiceSurveyResults} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';
import i18n from "@cdo/locale";

class MCSurveyOverviewContainer extends Component {
  static propTypes= {
    multipleChoiceSurveyData: PropTypes.arrayOf(multipleChoiceSurveyDataPropType),
  };

  render() {
    const {multipleChoiceSurveyData} = this.props;
    return (
      <div>
        <div>
        {/* <h2>{i18n.emptySurveyOverviewTable()}</h2>
          {multipleChoiceSurveyData.length < 5 &&
            <MultipleChoiceSurveyOverviewTable
            multipleChoiceSurveyData={[]}
          />
        } */}
        <h2>{i18n.multipleChoiceQuestionsOverview()}</h2>
          {multipleChoiceSurveyData.length > 0 &&
            <MultipleChoiceSurveyOverviewTable
              multipleChoiceSurveyData={multipleChoiceSurveyData}
            />
          }
        </div>
      </div>
    );
  }
}

export const UnconnectedMCSurveyOverviewContainer = MCSurveyOverviewContainer;

export default connect(state => ({
  multipleChoiceSurveyData: getMultipleChoiceSurveyResults(state),
}))(MCSurveyOverviewContainer);
