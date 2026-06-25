import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {
  QUESTION_CHARACTER_LIMIT,
  matchQuestionPropType,
  studentWithMatchResponsesPropType,
} from './assessmentDataShapes';
import MatchByStudentTable from './MatchByStudentTable';
import {
  getMatchStructureForCurrentAssessment,
  getStudentMatchResponsesForCurrentAssessment,
  ALL_STUDENT_FILTER,
  currentStudentHasResponses,
  setQuestionIndex,
} from './sectionAssessmentsRedux';

import moduleStyles from './match-by-student-container.module.scss';

class MatchByStudentContainer extends Component {
  static propTypes = {
    matchStructure: PropTypes.arrayOf(matchQuestionPropType),
    studentAnswerData: studentWithMatchResponsesPropType,
    studentId: PropTypes.number,
    currentStudentHasResponses: PropTypes.bool,
    openDialog: PropTypes.func.isRequired,
    setQuestionIndex: PropTypes.func.isRequired,
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
      currentStudentHasResponses,
    } = this.props;
    return (
      <div>
        {studentId !== ALL_STUDENT_FILTER && currentStudentHasResponses && (
          <div>
            <Typography variant="h2">
              {i18n.matchStudentOverview({
                studentName: studentAnswerData.name,
              })}
            </Typography>
            {matchStructure.map((question, index) => (
              <div key={index}>
                <div className={moduleStyles.questionLabel}>
                  {`${question.questionNumber}. ${question.question.slice(
                    0,
                    QUESTION_CHARACTER_LIMIT
                  )}`}
                  {question.question.length >= QUESTION_CHARACTER_LIMIT && (
                    <Link
                      size="s"
                      onClick={e => {
                        // Link defaults href to "#"; suppress the page-top jump
                        // since this opens a modal rather than navigating.
                        e.preventDefault();
                        this.selectQuestion(question.questionNumber - 1);
                      }}
                    >
                      {i18n.seeFullQuestion()}
                    </Link>
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

export const UnconnectedMatchByStudentContainer = MatchByStudentContainer;

export default connect(
  state => ({
    matchStructure: getMatchStructureForCurrentAssessment(state),
    studentAnswerData: getStudentMatchResponsesForCurrentAssessment(state),
    studentId: state.sectionAssessments.studentId,
    currentStudentHasResponses: currentStudentHasResponses(state),
  }),
  dispatch => ({
    setQuestionIndex(questionIndex) {
      dispatch(setQuestionIndex(questionIndex));
    },
  })
)(MatchByStudentContainer);
