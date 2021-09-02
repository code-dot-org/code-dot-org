import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {getSelectedScriptFriendlyName} from '@cdo/apps/redux/unitSelectionRedux';
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
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const CSV_FEEDBACK_RUBRIC_HEADERS = [
  {label: i18n.studentName(), key: 'studentName'},
  {label: i18n.lessonNumber(), key: 'lessonNum'},
  {label: i18n.lessonName(), key: 'lessonName'},
  {label: i18n.levelHeader(), key: 'levelNum'},
  {label: i18n.keyConcept(), key: 'keyConcept'},
  {label: i18n.performanceLevel(), key: 'performance'},
  {label: i18n.performanceLevelDetails(), key: 'performanceLevelDetails'},
  {label: i18n.reviewState(), key: 'reviewStateLabel'},
  {label: i18n.feedback(), key: 'comment'},
  {label: i18n.dateUpdatedByTeacher(), key: 'timestamp'},
  {label: i18n.dateSeenByStudent(), key: 'studentSeenFeedback'}
];

const CSV_FEEDBACK_NO_RUBRIC_HEADERS = [
  {label: i18n.studentName(), key: 'studentName'},
  {label: i18n.lessonNumber(), key: 'lessonNum'},
  {label: i18n.lessonName(), key: 'lessonName'},
  {label: i18n.levelHeader(), key: 'levelNum'},
  {label: i18n.reviewState(), key: 'reviewStateLabel'},
  {label: i18n.feedback(), key: 'comment'},
  {label: i18n.dateUpdatedByTeacher(), key: 'timestamp'},
  {label: i18n.dateSeenByStudent(), key: 'studentSeenFeedback'}
];

/*
 * Part of the Assessment Tab of Teacher Dashboard.
 * Shown when select a script that is either CSD or CSP
 * and you select the all feedback option from the
 * assessment dropdown.
 * */
class FeedbackDownload extends Component {
  static propTypes = {
    sectionName: PropTypes.string.isRequired,
    onClickDownload: PropTypes.func.isRequired,
    // provided by redux
    exportableFeedbackData: PropTypes.array.isRequired,
    scriptName: PropTypes.string.isRequired,
    isCurrentScriptCSD: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.headers = this.getHeaders(props.isCurrentScriptCSD);
  }

  getHeaders(isCurrentScriptCSD) {
    let headers = isCurrentScriptCSD
      ? CSV_FEEDBACK_RUBRIC_HEADERS
      : CSV_FEEDBACK_NO_RUBRIC_HEADERS;

    return headers;
  }

  render() {
    const {
      sectionName,
      exportableFeedbackData,
      scriptName,
      onClickDownload
    } = this.props;

    return (
      <div>
        <CSVLink
          filename={i18n.feedbackDownloadFileName({
            sectionName: sectionName,
            scriptName: scriptName,
            date: new Date().toDateString()
          })}
          data={exportableFeedbackData}
          headers={this.headers}
          onClick={onClickDownload}
        >
          <Button
            __useDeprecatedTag
            text={i18n.downloadFeedbackCSV()}
            onClick={() => {}}
            color={Button.ButtonColor.gray}
          />
        </CSVLink>
        <div>
          <SafeMarkdown
            markdown={i18n.feedbackDownloadOverview({
              sectionName: sectionName,
              scriptName: scriptName
            })}
          />
          <p>
            <FontAwesome icon="check-circle" style={styles.icon} />
            {i18n.feedbackDownloadRecommendation()}
          </p>
        </div>
      </div>
    );
  }
}

const styles = {
  icon: {
    color: color.purple,
    paddingRight: 5
  }
};

export const UnconnectedFeedbackDownload = FeedbackDownload;

export default connect(state => ({
  exportableFeedbackData: getExportableFeedbackData(state),
  scriptName: getSelectedScriptFriendlyName(state),
  isCurrentScriptCSD: isCurrentScriptCSD(state)
}))(FeedbackDownload);
