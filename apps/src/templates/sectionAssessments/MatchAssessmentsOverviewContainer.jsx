import PropTypes from 'prop-types';
import React, {Component} from 'react';
import MatchAssessmentsOverviewTable from './MatchAssessmentsOverviewTable';
import {
  getMatchSectionSummary,
  countSubmissionsForCurrentAssessment,
  ALL_STUDENT_FILTER,
  setQuestionIndex
} from './sectionAssessmentsRedux';
import {connect} from 'react-redux';
import {
  QUESTION_CHARACTER_LIMIT,
  matchDataPropType
} from './assessmentDataShapes';
import i18n from '@cdo/locale';
import {getTotalStudentCount} from '@cdo/apps/redux/sectionDataRedux';

class MatchAssessmentsOverviewContainer extends Component {
  static propTypes = {
    questionAnswerData: PropTypes.arrayOf(matchDataPropType),
    totalStudentCount: PropTypes.number,
    totalStudentSubmissions: PropTypes.number,
    studentId: PropTypes.number,
    openDialog: PropTypes.func.isRequired,
    setQuestionIndex: PropTypes.func.isRequired
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
      studentId
    } = this.props;

    return (
      <div>
        {questionAnswerData.length > 0 && studentId === ALL_STUDENT_FILTER && (
          <div>
            <h2>
              {i18n.matchQuestionsOverview({
                numSubmissions: totalStudentSubmissions,
                numStudents: totalStudentCount
              })}
            </h2>
            {questionAnswerData.map((question, index) => (
              <div key={index}>
                <div style={styles.text}>
                  {`${question.questionNumber}. ${question.question.slice(
                    0,
                    QUESTION_CHARACTER_LIMIT
                  )}`}
                  <a
                    onClick={() => {
                      this.selectQuestion(question.questionNumber - 1);
                    }}
                  >
                    <span>{i18n.seeFullQuestion()}</span>
                  </a>
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
    paddingBottom: 20
  }
};

export const UnconnectedMatchAssessmentsOverviewContainer = MatchAssessmentsOverviewContainer;

export default connect(
  state => ({
    questionAnswerData: getMatchSectionSummary(state),
    totalStudentSubmissions: countSubmissionsForCurrentAssessment(state),
    totalStudentCount: getTotalStudentCount(state),
    studentId: state.sectionAssessments.studentId
  }),
  dispatch => ({
    setQuestionIndex(questionIndex) {
      dispatch(setQuestionIndex(questionIndex));
    }
  })
)(MatchAssessmentsOverviewContainer);
