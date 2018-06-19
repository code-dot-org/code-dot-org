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

class FreeResponsesByAssessmentsContainer extends Component {
  static propTypes= {
    freeResponsesByStudentResponses: PropTypes.arrayOf(freeResponsesByStudentResponsesPropType),
    freeResponsesByQuestions: PropTypes.arrayOf(freeResponseQuestionsPropType),
  };

  render() {
    const {freeResponsesByStudentResponses} = this.props;

    return (
      <div>
        <h2>Free responses for Assessments</h2>
          <FreeResponsesAssessmentsTable
            freeResponses={freeResponsesByStudentResponses}
          />
      </div>
    );
  }
}

export const UnconnectedFreeResponsesByAssessmentsContainer = FreeResponsesByAssessmentsContainer;

export default connect(state => ({
  freeResponsesByStudentResponses: getStudentFreeResponsesAssessmentsAnswers(state),
  freeResponsesByQuestions: getFreeResponsesAssessmentsQuestions(state),
}))(FreeResponsesByAssessmentsContainer);

