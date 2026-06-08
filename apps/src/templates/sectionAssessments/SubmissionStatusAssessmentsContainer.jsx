import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {CSVLink} from 'react-csv';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {studentOverviewDataPropType} from './assessmentDataShapes';
import {
  getStudentsMCandMatchSummaryForCurrentAssessment,
  getExportableSubmissionStatusData,
} from './sectionAssessmentsRedux';
import SubmissionStatusAssessmentsTable from './SubmissionStatusAssessmentsTable';

import moduleStyles from './submission-status.module.scss';

export const studentExportableDataPropType = PropTypes.shape({
  studentName: PropTypes.string.isRequired,
  numMultipleChoiceCorrect: PropTypes.number,
  numMultipleChoice: PropTypes.number,
  numMatchCorrect: PropTypes.number,
  numMatch: PropTypes.number,
  submissionTimestamp: PropTypes.instanceOf(Date).isRequired,
});

const CSV_SUBMISSION_STATUS_HEADERS = [
  {label: i18n.studentNameHeader(), key: 'studentName'},
  {label: i18n.numMultipleChoiceCorrect(), key: 'numMultipleChoiceCorrect'},
  {label: i18n.numMultipleChoice(), key: 'numMultipleChoice'},
  {label: i18n.numMatchCorrect(), key: 'numMatchCorrect'},
  {label: i18n.numMatch(), key: 'numMatch'},
  {label: i18n.submissionTimestamp(), key: 'submissionTimestamp'},
];

class SubmissionStatusAssessmentsContainer extends Component {
  static propTypes = {
    // from redux
    localeCode: PropTypes.string,
    studentExportableData: PropTypes.arrayOf(studentExportableDataPropType),
    studentOverviewData: PropTypes.arrayOf(studentOverviewDataPropType),
  };

  render() {
    return (
      <div>
        <div className={moduleStyles.header}>
          <Typography variant="h2">
            {i18n.studentOverviewTableHeader()}
          </Typography>
          <MuiButton
            component={CSVLink}
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<FontAwesomeV6Icon iconName="download" />}
            filename="assessments-submission-status.csv"
            data={this.props.studentExportableData}
            headers={CSV_SUBMISSION_STATUS_HEADERS}
          >
            {i18n.downloadCSV()}
          </MuiButton>
        </div>
        <SubmissionStatusAssessmentsTable
          localeCode={this.props.localeCode}
          studentOverviewData={this.props.studentOverviewData}
        />
      </div>
    );
  }
}

export const UnconnectedSubmissionStatusAssessmentsContainer =
  SubmissionStatusAssessmentsContainer;

export default connect(state => ({
  localeCode: state.locales.localeCode,
  studentExportableData: getExportableSubmissionStatusData(state),
  studentOverviewData: getStudentsMCandMatchSummaryForCurrentAssessment(state),
}))(SubmissionStatusAssessmentsContainer);
