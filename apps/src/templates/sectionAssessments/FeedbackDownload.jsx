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
    color: color.purple,
    paddingRight: 5
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
          filename={i18n.feedbackDownloadFileName({
            sectionName: sectionName,
            scriptName: scriptName,
            date: new Date().toDateString()
          })}
          data={exportableFeedbackData}
          headers={HEADERS}
        >
          <Button
            text={i18n.downloadFeedbackCSV()}
            onClick={() => {}}
            color={Button.ButtonColor.gray}
          />
        </CSVLink>
        <div>
          <p>
            {i18n.feedbackDownloadOverviewPart1({sectionName: sectionName})}
            <strong>{scriptName}</strong>
            {i18n.feedbackDownloadOverviewPart2()}
          </p>
          <p>
            <FontAwesome icon="check-circle" style={styles.icon} />
            {i18n.feedbackDownloadRecommendation()}
          </p>
        </div>
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
