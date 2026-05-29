import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {CSVLink} from 'react-csv';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {
  asyncLoadAssessments,
  getCurrentScriptAssessmentList,
  setAssessmentId,
  isCurrentAssessmentSurvey,
  countSubmissionsForCurrentAssessment,
  getExportableData,
  setStudentId,
  ASSESSMENT_FEEDBACK_OPTION_ID,
} from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import UnitSelectorV2 from '@cdo/apps/templates/teacherDashboardShared/UnitSelectorV2';
import i18n from '@cdo/locale';

import AssessmentSelector from './AssessmentSelector';
import FeedbackDownload from './FeedbackDownload';
import FreeResponseDetailsDialog from './FreeResponseDetailsDialog';
import FreeResponsesAssessmentsContainer from './FreeResponsesAssessmentsContainer';
import FreeResponsesSurveyContainer from './FreeResponsesSurveyContainer';
import MatchAssessmentsOverviewContainer from './MatchAssessmentsOverviewContainer';
import MatchByStudentContainer from './MatchByStudentContainer';
import MatchDetailsDialog from './MatchDetailsDialog';
import MultipleChoiceAssessmentsOverviewContainer from './MultipleChoiceAssessmentsOverviewContainer';
import MultipleChoiceByStudentContainer from './MultipleChoiceByStudentContainer';
import MultipleChoiceDetailsDialog from './MultipleChoiceDetailsDialog';
import MultipleChoiceSurveyOverviewContainer from './MultipleChoiceSurveyOverviewContainer';
import StudentSelector from './StudentSelector';
import SubmissionStatusAssessmentsContainer from './SubmissionStatusAssessmentsContainer';

import moduleStyles from './section-assessments.module.scss';

const CSV_ASSESSMENT_HEADERS = [
  {label: i18n.name(), key: 'studentName'},
  {label: i18n.lesson(), key: 'lesson'},
  {label: i18n.timeStamp, key: 'timestamp'},
  {label: i18n.question(), key: 'question'},
  {label: i18n.response(), key: 'response'},
  {label: i18n.correct(), key: 'correct'},
];

const CSV_SURVEY_HEADERS = [
  {label: i18n.lesson(), key: 'lesson'},
  {label: i18n.question(), key: 'questionNumber'},
  {label: i18n.questionText(), key: 'questionText'},
  {label: i18n.response(), key: 'answer'},
  {label: i18n.count(), key: 'numberAnswered'},
];

class SectionAssessments extends Component {
  static propTypes = {
    sectionName: PropTypes.string.isRequired,
    // provided by redux
    sectionId: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    assessmentList: PropTypes.array.isRequired,
    scriptId: PropTypes.number,
    courseVersionId: PropTypes.number,
    assessmentId: PropTypes.number,
    setAssessmentId: PropTypes.func.isRequired,
    asyncLoadAssessments: PropTypes.func.isRequired,
    multipleChoiceSurveyResults: PropTypes.array,
    isCurrentAssessmentSurvey: PropTypes.bool,
    totalStudentSubmissions: PropTypes.number,
    exportableData: PropTypes.array,
    studentId: PropTypes.number,
    setStudentId: PropTypes.func,
    studentList: PropTypes.array,
  };

  state = {
    freeResponseDetailDialogOpen: false,
    multipleChoiceDetailDialogOpen: false,
    matchDetailDialogOpen: false,
  };

  componentDidMount() {
    const {scriptId, asyncLoadAssessments, sectionId, courseVersionId} =
      this.props;
    asyncLoadAssessments(sectionId, scriptId, courseVersionId);
  }

  componentDidUpdate(prevProps) {
    const {scriptId, courseVersionId, asyncLoadAssessments, sectionId} =
      this.props;

    // If the unit selection changed, reload assessments
    if (
      (prevProps.scriptId !== scriptId ||
        prevProps.courseVersionId !== courseVersionId) &&
      scriptId &&
      courseVersionId
    ) {
      asyncLoadAssessments(sectionId, scriptId, courseVersionId);
    }
  }

  onSelectAssessment = newAssessmentId => {
    const {setAssessmentId} = this.props;
    setAssessmentId(newAssessmentId);
  };

  onSelectStudent = studentId => {
    const {setStudentId} = this.props;
    setStudentId(studentId);
  };

  showFreeResponseDetailDialog = () => {
    this.setState({
      freeResponseDetailDialogOpen: true,
    });
  };

  hideFreeResponseDetailDialog = () => {
    this.setState({
      freeResponseDetailDialogOpen: false,
    });
  };

  showMulitpleChoiceDetailDialog = () => {
    this.setState({
      multipleChoiceDetailDialogOpen: true,
    });
  };

  hideMultipleChoiceDetailDialog = () => {
    this.setState({
      multipleChoiceDetailDialogOpen: false,
    });
  };

  showMatchDetailDialog = () => {
    this.setState({
      matchDetailDialogOpen: true,
    });
  };

  hideMatchDetailDialog = () => {
    this.setState({
      matchDetailDialogOpen: false,
    });
  };

  render() {
    const {
      sectionName,
      assessmentList,
      assessmentId,
      isLoading,
      isCurrentAssessmentSurvey,
      totalStudentSubmissions,
      exportableData,
      studentId,
      studentList,
    } = this.props;

    const isCurrentAssessmentFeedbackOption =
      this.props.assessmentId === ASSESSMENT_FEEDBACK_OPTION_ID;

    return (
      // eslint-disable-next-line react/forbid-dom-props
      <div data-testid={'assessments-tab'}>
        <div className={moduleStyles.selectors}>
          <div className={moduleStyles.unitSelection}>
            <Typography variant="h4" className={moduleStyles.header}>
              {i18n.selectACourse()}
            </Typography>
            <UnitSelectorV2 v1Styles />
          </div>
          {!isLoading && assessmentList.length > 0 && (
            <div className={moduleStyles.assessmentSelection}>
              <Typography variant="h4" className={moduleStyles.header}>
                {i18n.selectAssessment()}
              </Typography>
              <AssessmentSelector
                assessmentList={assessmentList}
                assessmentId={assessmentId}
                onChange={this.onSelectAssessment}
              />
            </div>
          )}
        </div>
        {!isLoading && assessmentList.length > 0 && (
          <div className={moduleStyles.tableContent}>
            {/* Assessments */}
            {!isCurrentAssessmentSurvey &&
              !isCurrentAssessmentFeedbackOption && (
                <div>
                  <Typography variant="h4" className={moduleStyles.header}>
                    {i18n.selectStudent()}
                  </Typography>
                  <StudentSelector
                    studentList={studentList}
                    studentId={studentId}
                    onChange={this.onSelectStudent}
                  />
                  {totalStudentSubmissions > 0 && (
                    <div className={moduleStyles.download}>
                      <MuiButton
                        component={CSVLink}
                        size="small"
                        variant="text"
                        color="secondary"
                        startIcon={<FontAwesomeV6Icon iconName="download" />}
                        filename="assessments.csv"
                        data={exportableData}
                        headers={CSV_ASSESSMENT_HEADERS}
                      >
                        {i18n.downloadAssessmentCSV()}
                      </MuiButton>
                    </div>
                  )}
                  {totalStudentSubmissions <= 0 && (
                    <Typography variant="body3" gutterBottom>
                      {i18n.emptyAssessmentSubmissions()}
                    </Typography>
                  )}
                  <SubmissionStatusAssessmentsContainer />
                  {totalStudentSubmissions > 0 && (
                    <div>
                      <MultipleChoiceAssessmentsOverviewContainer
                        openDialog={this.showMulitpleChoiceDetailDialog}
                      />
                      <MultipleChoiceByStudentContainer />
                      <MatchAssessmentsOverviewContainer
                        openDialog={this.showMatchDetailDialog}
                      />
                      <MatchByStudentContainer
                        openDialog={this.showMatchDetailDialog}
                      />
                      <FreeResponsesAssessmentsContainer
                        openDialog={this.showFreeResponseDetailDialog}
                      />
                    </div>
                  )}
                </div>
              )}
            {/* Feedback Download */}
            {isCurrentAssessmentFeedbackOption && (
              <FeedbackDownload sectionName={sectionName} />
            )}
            {/* Surveys */}
            {isCurrentAssessmentSurvey && (
              <div>
                {totalStudentSubmissions > 0 && (
                  <div>
                    <div className={moduleStyles.download}>
                      <MuiButton
                        component={CSVLink}
                        variant="text"
                        startIcon={<FontAwesomeV6Icon iconName="download" />}
                        filename="surveys.csv"
                        data={exportableData}
                        headers={CSV_SURVEY_HEADERS}
                      >
                        {i18n.downloadAssessmentCSV()}
                      </MuiButton>
                    </div>
                    <MultipleChoiceSurveyOverviewContainer />
                    <FreeResponsesSurveyContainer
                      openDialog={this.showFreeResponseDetailDialog}
                    />
                  </div>
                )}
                {totalStudentSubmissions <= 0 && (
                  <SafeMarkdown markdown={i18n.emptySurveyOverviewTable()} />
                )}
              </div>
            )}
            <FreeResponseDetailsDialog
              isDialogOpen={this.state.freeResponseDetailDialogOpen}
              closeDialog={this.hideFreeResponseDetailDialog}
            />
            <MultipleChoiceDetailsDialog
              isDialogOpen={this.state.multipleChoiceDetailDialogOpen}
              closeDialog={this.hideMultipleChoiceDetailDialog}
            />
            <MatchDetailsDialog
              isDialogOpen={this.state.matchDetailDialogOpen}
              closeDialog={this.hideMatchDetailDialog}
            />
          </div>
        )}
        {isLoading && (
          <div>
            <Spinner size="large" />
          </div>
        )}
        {!isLoading && assessmentList.length === 0 && (
          <Typography variant="body3">{i18n.noAssessments()}</Typography>
        )}
      </div>
    );
  }
}

export const UnconnectedSectionAssessments = SectionAssessments;

export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId,
    isLoading: !!state.sectionAssessments.isLoading,
    assessmentList: getCurrentScriptAssessmentList(state),
    scriptId: state.unitSelection.scriptId,
    courseVersionId: state.unitSelection.courseVersionId,
    assessmentId: state.sectionAssessments.assessmentId,
    isCurrentAssessmentSurvey: isCurrentAssessmentSurvey(state),
    totalStudentSubmissions: countSubmissionsForCurrentAssessment(state),
    exportableData: getExportableData(state),
    studentId: state.sectionAssessments.studentId,
    studentList: state.teacherSections.selectedStudents,
  }),
  dispatch => ({
    asyncLoadAssessments(sectionId, scriptId, courseVersionId) {
      return dispatch(
        asyncLoadAssessments(sectionId, scriptId, courseVersionId)
      );
    },
    setAssessmentId(assessmentId) {
      dispatch(setAssessmentId(assessmentId));
    },
    setStudentId(studentId) {
      dispatch(setStudentId(studentId));
    },
  })
)(SectionAssessments);
