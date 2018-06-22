import React, {Component, PropTypes} from 'react';
import FreeResponsesAssessmentsTable from './FreeResponsesAssessmentsTable';
import {freeResponsesDataPropType} from './assessmentDataShapes';
import {
  getAssessmentsFreeResponseResults,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';

export const freeResponseSummaryPropType = PropTypes.shape({
  questionText:  PropTypes.string,
  responses: PropTypes.arrayOf(freeResponsesDataPropType),
});

class FreeResponsesAssessmentsContainer extends Component {
  static propTypes= {
    freeResponseQuestions: PropTypes.arrayOf(freeResponseSummaryPropType),
  };

  render() {
    const {freeResponseQuestions} = this.props;

    return (
      <div>
        <h2>Free responses for Assessments</h2>
        {freeResponseQuestions.map((question, index) => (
          <div key={index}>
            <h3>{`${question.questionNumber}. ${question.questionText}`}</h3>
            <FreeResponsesAssessmentsTable
              freeResponses={question.responses}
            />
          </div>
        ))}
      </div>
    );
  }
}

export const UnconnectedFreeResponsesAssessmentsContainer = FreeResponsesAssessmentsContainer;

export default connect(state => ({
  freeResponseQuestions: getAssessmentsFreeResponseResults(state),
}))(FreeResponsesAssessmentsContainer);

