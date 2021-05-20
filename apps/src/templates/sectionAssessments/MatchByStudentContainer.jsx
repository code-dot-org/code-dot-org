import PropTypes from 'prop-types';
import React, {Component} from 'react';
import MatchByStudentTable from './MatchByStudentTable';
import {
  getMatchStructureForCurrentAssessment,
  getStudentMatchResponsesForCurrentAssessment,
  ALL_STUDENT_FILTER,
  currentStudentHasResponses,
  setQuestionIndex
} from './sectionAssessmentsRedux';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import {
  QUESTION_CHARACTER_LIMIT,
  matchQuestionPropType,
  studentWithMatchResponsesPropType
} from './assessmentDataShapes';

class MatchByStudentContainer extends Component {
  static propTypes = {
    matchStructure: PropTypes.arrayOf(matchQuestionPropType),
    studentAnswerData: studentWithMatchResponsesPropType,
    studentId: PropTypes.number,
    currentStudentHasResponses: PropTypes.bool,
    openDialog: PropTypes.func.isRequired,
    setQuestionIndex: PropTypes.func.isRequired
  };

  selectQuestion = index => {
    this.props.setQuestionIndex(index);
    this.props.openDialog();
  };

  render() {
    const {
      matchStructure,
      studentAnswerData,
      studentId,
      currentStudentHasResponses
    } = this.props;
    return (
      <div>
        {studentId !== ALL_STUDENT_FILTER && currentStudentHasResponses && (
          <div>
            <h2>
              {i18n.matchStudentOverview({
                studentName: studentAnswerData.name
              })}
            </h2>
            {matchStructure.map((question, index) => (
              <div key={index}>
                <div style={styles.text}>
                  {`${question.questionNumber}. ${question.question.slice(
                    0,
                    QUESTION_CHARACTER_LIMIT
                  )}`}
                  {question.question.length >= QUESTION_CHARACTER_LIMIT && (
                    <a
                      onClick={() => {
                        this.selectQuestion(question.questionNumber - 1);
                      }}
                    >
                      <span>{i18n.seeFullQuestion()}</span>
                    </a>
                  )}
                </div>
                <MatchByStudentTable
                  questionAnswerData={question}
                  studentAnswerData={studentAnswerData.studentResponses[index]}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  text: {
    font: 10,
    paddingTop: 20,
    paddingBottom: 20
  }
};

export const UnconnectedMatchByStudentContainer = MatchByStudentContainer;

export default connect(
  state => ({
    matchStructure: getMatchStructureForCurrentAssessment(state),
    studentAnswerData: getStudentMatchResponsesForCurrentAssessment(state),
    studentId: state.sectionAssessments.studentId,
    currentStudentHasResponses: currentStudentHasResponses(state)
  }),
  dispatch => ({
    setQuestionIndex(questionIndex) {
      dispatch(setQuestionIndex(questionIndex));
    }
  })
)(MatchByStudentContainer);
