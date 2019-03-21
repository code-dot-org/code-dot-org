import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {getSelectedScriptFriendlyName} from '@cdo/apps/redux/scriptSelectionRedux';
import {
  getExportableFeedbackData,
  isCurrentScriptCSD
} from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {CSVLink} from 'react-csv';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

const CSV_FEEDBACK_RUBRIC_HEADERS = [
  {label: 'Student Name', key: 'studentName'},
  {label: 'Lesson Number', key: 'stageNum'},
  {label: 'Lesson Name', key: 'stageName'},
  {label: 'Level', key: 'levelNum'},
  {label: 'Key Concept', key: 'keyConcept'},
  {label: 'Performance Level', key: 'performance'},
  {label: 'Performance Level Details', key: 'performanceLevelDetails'},
  {label: 'Feedback', key: 'comment'},
  {label: 'Date Updated By Teacher', key: 'timestamp'}
];

const CSV_FEEDBACK_NO_RUBRIC_HEADERS = [
  {label: 'Student Name', key: 'studentName'},
  {label: 'Lesson Number', key: 'stageNum'},
  {label: 'Lesson Name', key: 'stageName'},
  {label: 'Level', key: 'levelNum'},
  {label: 'Feedback', key: 'comment'},
  {label: 'Date Updated By Teacher', key: 'timestamp'}
];

const styles = {
  icon: {
    color: color.purple
  }
};

class FeedbackDownload extends Component {
  static propTypes = {
    sectionName: PropTypes.string.isRequired,
    // provided by redux
    exportableFeedbackData: PropTypes.array,
    scriptName: PropTypes.string,
    isCurrentScriptCSD: PropTypes.bool
  };

  render() {
    const {
      sectionName,
      exportableFeedbackData,
      scriptName,
      isCurrentScriptCSD
    } = this.props;

    const HEADERS = isCurrentScriptCSD
      ? CSV_FEEDBACK_RUBRIC_HEADERS
      : CSV_FEEDBACK_NO_RUBRIC_HEADERS;

    return (
      <div>
        <CSVLink
          filename={`Feedback for ${sectionName} in ${scriptName} on ${new Date().toDateString()}.csv`}
          data={exportableFeedbackData}
          headers={HEADERS}
        >
          <Button
            text={i18n.downloadFeedbackCSV()}
            onClick={() => {}}
            color={Button.ButtonColor.gray}
          />
        </CSVLink>
        <p>
          {`This CSV file contains all feedback you’ve completed for your section
            ${sectionName}
           in levels within `}
          <strong>{scriptName}</strong>
          {`. You can leave feedback your students by going to a level in this unit, viewing a students work,
             and clicking the “Feedback” tab`}
        </p>
        <FontAwesome icon="check_circle" className="fa" style={styles.icon} />
        <p>
          {
            'We recommend checking student progress and giving feedback on levels marked as assessment opportunities.'
          }
        </p>
      </div>
    );
  }
}

export const UnconnectedFeedbackDownload = FeedbackDownload;

export default connect(state => ({
  exportableFeedbackData: getExportableFeedbackData(state),
  scriptName: getSelectedScriptFriendlyName(state),
  isCurrentScriptCSD: isCurrentScriptCSD(state)
}))(FeedbackDownload);
