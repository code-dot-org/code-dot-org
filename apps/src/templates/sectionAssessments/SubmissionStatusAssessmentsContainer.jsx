import PropTypes from 'prop-types';
import React, {Component} from 'react';
import SubmissionStatusAssessmentsTable, {
  studentOverviewDataPropType
} from './SubmissionStatusAssessmentsTable';
import {
  getStudentsMCSummaryForCurrentAssessment,
  getExportableSubmissionStatusData
} from './sectionAssessmentsRedux';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {CSVLink} from 'react-csv';
import Button from '../Button';

const styles = {
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  }
};

export const studentExportableDataPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  numMultipleChoiceCorrect: PropTypes.number,
  numMultipleChoice: PropTypes.number,
  submissionTimeStamp: PropTypes.string.isRequired
});

const CSV_SUBMISSION_STATUS_HEADERS = [
  {label: i18n.studentNameHeader(), key: 'studentName'},
  {label: i18n.numMultipleChoiceCorrect(), key: 'numMultipleChoiceCorrect'},
  {label: i18n.numMultipleChoice(), key: 'numMultipleChoice'},
  {label: i18n.submissionTimestamp(), key: 'submissionTimestamp'}
];

class SubmissionStatusAssessmentsContainer extends Component {
  static propTypes = {
    studentOverviewData: PropTypes.arrayOf(studentOverviewDataPropType),
    studentExportableData: PropTypes.arrayOf(studentExportableDataPropType)
  };

  render() {
    const {studentExportableData} = this.props;
    return (
      <div>
        <div style={styles.buttonContainer}>
          <h2>{i18n.studentOverviewTableHeader()}</h2>
          <CSVLink
            filename="assessments-submission-status.csv"
            data={studentExportableData}
            headers={CSV_SUBMISSION_STATUS_HEADERS}
          >
            <Button
              text={i18n.downloadCSV()}
              onClick={() => {}}
              color={Button.ButtonColor.gray}
            />
          </CSVLink>
        </div>
        <SubmissionStatusAssessmentsTable
          studentOverviewData={this.props.studentOverviewData}
        />
      </div>
    );
  }
}

export const UnconnectedSubmissionStatusAssessmentsContainer = SubmissionStatusAssessmentsContainer;

export default connect(state => ({
  studentOverviewData: getStudentsMCSummaryForCurrentAssessment(state),
  studentExportableData: getExportableSubmissionStatusData(state)
}))(SubmissionStatusAssessmentsContainer);
