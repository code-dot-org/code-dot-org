import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {
  QUESTION_CHARACTER_LIMIT,
  matchDataPropType,
} from './assessmentDataShapes';
import MatchAssessmentsOverviewTable from './MatchAssessmentsOverviewTable';
import {
  getMatchSectionSummary,
  countSubmissionsForCurrentAssessment,
  ALL_STUDENT_FILTER,
  setQuestionIndex,
} from './sectionAssessmentsRedux';

class MatchAssessmentsOverviewContainer extends Component {
  static propTypes = {
    questionAnswerData: PropTypes.arrayOf(matchDataPropType),
    totalStudentCount: PropTypes.number,
    totalStudentSubmissions: PropTypes.number,
    studentId: PropTypes.number,
    openDialog: PropTypes.func.isRequired,
    setQuestionIndex: PropTypes.func.isRequired,
  };

  selectQuestion = index => {
    this.props.setQuestionIndex(index);
    this.props.openDialog();
  };

  render() {
    const {
      questionAnswerData,
      totalStudentCount,
      totalStudentSubmissions,
      studentId,
    } = this.props;

    return (
      <div>
        {questionAnswerData.length > 0 && studentId === ALL_STUDENT_FILTER && (
          <div>
            <h2>
              {i18n.matchQuestionsOverview({
                numSubmissions: totalStudentSubmissions,
                numStudents: totalStudentCount,
              })}
            </h2>
            {questionAnswerData.map((question, index) => (
              <div key={index}>
                <div style={styles.text}>
                  {`${question.questionNumber}. ${question.question.slice(
                    0,
                    QUESTION_CHARACTER_LIMIT
                  )}`}
                  <button
                    type="button"
                    onClick={() => {
                      this.selectQuestion(question.questionNumber - 1);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      font: 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{i18n.seeFullQuestion()}</span>
                  </button>
                </div>
                <MatchAssessmentsOverviewTable
                  questionAnswerData={question.options}
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
    paddingBottom: 20,
  },
};

export const UnconnectedMatchAssessmentsOverviewContainer =
  MatchAssessmentsOverviewContainer;

export default connect(
  state => ({
    questionAnswerData: getMatchSectionSummary(state),
    totalStudentSubmissions: countSubmissionsForCurrentAssessment(state),
    totalStudentCount: state.teacherSections.selectedStudents.length,
    studentId: state.sectionAssessments.studentId,
  }),
  dispatch => ({
    setQuestionIndex(questionIndex) {
      dispatch(setQuestionIndex(questionIndex));
    },
  })
)(MatchAssessmentsOverviewContainer);
