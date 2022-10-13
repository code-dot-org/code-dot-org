import PropTypes from 'prop-types';
import React, {Component} from 'react';
import SubmissionStatusAssessmentsTable from './SubmissionStatusAssessmentsTable';
import {studentOverviewDataPropType} from './assessmentDataShapes';
import {
  getStudentsMCandMatchSummaryForCurrentAssessment,
  getExportableSubmissionStatusData
} from './sectionAssessmentsRedux';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {CSVLink} from 'react-csv';
import Button from '../Button';

export const studentExportableDataPropType = PropTypes.shape({
  studentName: PropTypes.string.isRequired,
  numMultipleChoiceCorrect: PropTypes.number,
  numMultipleChoice: PropTypes.number,
  numMatchCorrect: PropTypes.number,
  numMatch: PropTypes.number,
  submissionTimestamp: PropTypes.instanceOf(Date).isRequired
});

const CSV_SUBMISSION_STATUS_HEADERS = [
  {label: i18n.studentNameHeader(), key: 'studentName'},
  {label: i18n.numMultipleChoiceCorrect(), key: 'numMultipleChoiceCorrect'},
  {label: i18n.numMultipleChoice(), key: 'numMultipleChoice'},
  {label: i18n.numMatchCorrect(), key: 'numMatchCorrect'},
  {label: i18n.numMatch(), key: 'numMatch'},
  {label: i18n.submissionTimestamp(), key: 'submissionTimestamp'}
];

class SubmissionStatusAssessmentsContainer extends Component {
  static propTypes = {
    onClickDownload: PropTypes.func.isRequired,
    // from redux
    localeCode: PropTypes.string,
    studentExportableData: PropTypes.arrayOf(studentExportableDataPropType),
    studentOverviewData: PropTypes.arrayOf(studentOverviewDataPropType)
  };

  render() {
    return (
      <div>
        <div style={styles.buttonContainer}>
          <h2>{i18n.studentOverviewTableHeader()}</h2>
          <CSVLink
            filename="assessments-submission-status.csv"
            data={this.props.studentExportableData}
            headers={CSV_SUBMISSION_STATUS_HEADERS}
            onClick={this.props.onClickDownload}
          >
            <Button
              __useDeprecatedTag
              text={i18n.downloadCSV()}
              onClick={() => {}}
              color={Button.ButtonColor.gray}
            />
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
    alignItems: 'flex-end'
  }
};

export const UnconnectedSubmissionStatusAssessmentsContainer = SubmissionStatusAssessmentsContainer;

export default connect(state => ({
  localeCode: state.locales.localeCode,
  studentExportableData: getExportableSubmissionStatusData(state),
  studentOverviewData: getStudentsMCandMatchSummaryForCurrentAssessment(state)
}))(SubmissionStatusAssessmentsContainer);
