import React, {Component, PropTypes} from 'react';
import FreeResponsesAssessmentsTable from './FreeResponsesAssessmentsTable';
import {
  getAssessmentsFreeResponseResults,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';

class FreeResponsesAssessmentsContainer extends Component {
  static propTypes= {
    freeResponseQuestions: PropTypes.array,
  };

  render() {
    const {freeResponseQuestions} = this.props;

    return (
      <div>
        <h2>Free responses for Assessments</h2>
        {freeResponseQuestions.map((question, index) => (
          <div key={index}>
            <h3>{question.questionText}</h3>
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

