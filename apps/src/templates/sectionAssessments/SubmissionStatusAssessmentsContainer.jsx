import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {CSVLink} from 'react-csv';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

import {studentOverviewDataPropType} from './assessmentDataShapes';
import {
  getStudentsMCandMatchSummaryForCurrentAssessment,
  getExportableSubmissionStatusData,
} from './sectionAssessmentsRedux';
import SubmissionStatusAssessmentsTable from './SubmissionStatusAssessmentsTable';

import moduleStyles from '@cdo/apps/legacySharedComponents/button.module.scss';

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
    onClickDownload: PropTypes.func.isRequired,
    // from redux
    localeCode: PropTypes.string,
    studentExportableData: PropTypes.arrayOf(studentExportableDataPropType),
    studentOverviewData: PropTypes.arrayOf(studentOverviewDataPropType),
  };

  render() {
    // These allow the CSVLink to be styled as a button
    let className = classNames(
      moduleStyles.main,
      moduleStyles[Button.ButtonColor.gray],
      moduleStyles['default']
    );

    return (
      <div>
        <div style={styles.buttonContainer}>
          <h2>{i18n.studentOverviewTableHeader()}</h2>
          <CSVLink
            role="button"
            filename="assessments-submission-status.csv"
            data={this.props.studentExportableData}
            headers={CSV_SUBMISSION_STATUS_HEADERS}
            onClick={this.props.onClickDownload}
            style={styles.button}
            className={className}
          >
            {i18n.downloadCSV()}
          </CSVLink>
        </div>
        <SubmissionStatusAssessmentsTable
          localeCode={this.props.localeCode}
          studentOverviewData={this.props.studentOverviewData}
        />
      </div>
    );
  }
}

const styles = {
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  button: {
    padding: '12px 24px',
    lineHeight: '10px',
    marginBottom: '5px',
  },
};

export const UnconnectedSubmissionStatusAssessmentsContainer =
  SubmissionStatusAssessmentsContainer;

export default connect(state => ({
  localeCode: state.locales.localeCode,
  studentExportableData: getExportableSubmissionStatusData(state),
  studentOverviewData: getStudentsMCandMatchSummaryForCurrentAssessment(state),
}))(SubmissionStatusAssessmentsContainer);
