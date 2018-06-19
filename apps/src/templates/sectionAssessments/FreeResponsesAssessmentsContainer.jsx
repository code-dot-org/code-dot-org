import React, {Component, PropTypes} from 'react';
import FreeResponsesAssessmentsTable from './FreeResponsesAssessmentsTable';
import {
  getStudentFreeResponsesAssessmentsAnswers,
  getFreeResponsesAssessmentsQuestions,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';

const freeResponseQuestionsPropType = PropTypes.shape({
  questionText: PropTypes.string,
});

const freeResponsesByStudentResponsesPropType = PropTypes.shape({
  id:  PropTypes.number,
  name: PropTypes.string.isRequired,
  response: PropTypes.string,
});

class FreeResponsesAssessmentsContainer extends Component {
  static propTypes= {
    freeResponsesByStudentResponses: PropTypes.arrayOf(freeResponsesByStudentResponsesPropType),
    freeResponseQuestions: PropTypes.arrayOf(PropTypes.string),
  };

  render() {
    const {freeResponsesByStudentResponses, freeResponseQuestions} = this.props;
    console.log('output', freeResponseQuestions);
    return (
      <div>
        <h2>Free responses for Assessments</h2>
        {freeResponseQuestions.map((questionText, index) => (
          <div key={index}>
            <h3>{questionText}</h3>
          </div>
        ))}
      </div>
    );
  }
}

export const UnconnectedFreeResponsesAssessmentsContainer = FreeResponsesAssessmentsContainer;

export default connect(state => ({
  freeResponsesByStudentResponses: getStudentFreeResponsesAssessmentsAnswers(state),
  freeResponseQuestions: getFreeResponsesAssessmentsQuestions(state),
}))(FreeResponsesAssessmentsContainer);

