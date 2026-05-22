import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
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

import moduleStyles from './match-overview-container.module.scss';

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
            <Typography variant="h2">
              {i18n.matchQuestionsOverview({
                numSubmissions: totalStudentSubmissions,
                numStudents: totalStudentCount,
              })}
            </Typography>
            {questionAnswerData.map((question, index) => (
              <div key={index}>
                <div className={moduleStyles.questionLabel}>
                  {`${question.questionNumber}. ${question.question.slice(
                    0,
                    QUESTION_CHARACTER_LIMIT
                  )}`}
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
