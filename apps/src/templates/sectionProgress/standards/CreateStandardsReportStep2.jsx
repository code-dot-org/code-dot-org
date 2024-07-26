import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {getCurrentUnitData} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

import DialogFooter from '../../teacherDashboard/DialogFooter';

class CreateStandardsReportStep2 extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    onBack: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    onCommentChange: PropTypes.func.isRequired,
    //redux
    teacherComment: PropTypes.string,
    versionYear: PropTypes.string,
    familyName: PropTypes.string,
  };

  commentChanged = event => {
    const cursorPosition = event.target.selectionStart;
    const commentBox = event.target;
    window.requestAnimationFrame(() => {
      commentBox.selectionStart = cursorPosition;
      commentBox.selectionEnd = cursorPosition;
    });
    this.props.onCommentChange(event.target.value);
  };

  render() {
    const {versionYear, familyName} = this.props;
    const showLinkToStandardsOverview = versionYear >= 2020;
    return (
      <div>
        <div style={styles.header}>
          <h3>{i18n.createStandardsReportStep2()}</h3>
          <span style={styles.optionalText}>{i18n.optional()}</span>
        </div>
        <SafeMarkdown markdown={i18n.createStandardsReportPrompt()} />
        <SafeMarkdown markdown={i18n.createStandardsReportSuggestion()} />
        <ul>
          <li>
            <SafeMarkdown markdown={i18n.createStandardsReportSuggestion1()} />
          </li>
          <li>
            {showLinkToStandardsOverview && (
              <SafeMarkdown
                openExternalLinksInNewTab={true}
                markdown={i18n.createStandardsReportSuggestion2Link({
                  standardsOverviewLink: `http://curriculum.code.org/csf-${versionYear.slice(
                    -2
                  )}/${familyName}/standards`,
                })}
              />
            )}
            {!showLinkToStandardsOverview && (
              <SafeMarkdown
                markdown={i18n.createStandardsReportSuggestion2()}
              />
            )}
          </li>
          <li>
            <SafeMarkdown
              openExternalLinksInNewTab={true}
              markdown={i18n.createStandardsReportSuggestion4({
                projectsLink: teacherDashboardUrl(
                  this.props.sectionId,
                  '/projects'
                ),
              })}
            />
          </li>
        </ul>
        <textarea
          type="text"
          placeholder={i18n.createStandardsReportSampleNoteText()}
          value={
            this.props.teacherComment ? this.props.teacherComment : undefined
          }
          onChange={this.commentChanged}
          style={styles.textArea}
          aria-label={i18n.createStandardsReportStep2()}
        />
        <DialogFooter>
          <Button
            text={i18n.back()}
            onClick={this.props.onBack}
            color={Button.ButtonColor.gray}
            style={styles.backButton}
          />
          <Button
            text={i18n.createReport()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.brandSecondaryDefault}
            className="uitest-standards-generate-report-finish"
            style={styles.createButton}
          />
        </DialogFooter>
      </div>
    );
  }
}

const styles = {
  textArea: {
    minHeight: 100,
    width: '95%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionalText: {
    paddingLeft: 10,
  },
  createButton: {
    margin: 0,
  },
  backButton: {
    margin: 0,
    boxShadow: 'inset 0 2px 0 0 rgb(255 255 255 / 40%)',
  },
};

export const UnconnectedCreateStandardsReportStep2 = CreateStandardsReportStep2;

export default connect(state => ({
  teacherComment: state.sectionStandardsProgress.teacherComment,
  versionYear: getCurrentUnitData(state).version_year,
  familyName: getCurrentUnitData(state).family_name,
}))(CreateStandardsReportStep2);
