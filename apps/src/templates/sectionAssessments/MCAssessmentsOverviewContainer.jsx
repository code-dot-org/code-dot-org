import React, {Component, PropTypes} from 'react';
import MultipleChoiceAssessmentsOverviewTable from './MultipleChoiceAssessmentsOverviewTable';
import {getMultipleChoiceSectionSummary} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';
import { multipleChoiceDataPropType } from './assessmentDataShapes';
import i18n from "@cdo/locale";

class MCAssessmentsOverviewContainer extends Component {
  static propTypes= {
    questionAnswerData: PropTypes.arrayOf(multipleChoiceDataPropType),
    totalStudentCount: PropTypes.number,
  };

  render() {
    const {questionAnswerData, totalStudentCount} = this.props;
    return (
      <div>
        {questionAnswerData.length > 0 &&
          <div>
            <h2>
              {i18n.multipleChoiceQuestionsOverview({numSubmissions: 3, numStudents: totalStudentCount})}
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
}))(MCAssessmentsOverviewContainer);
