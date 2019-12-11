import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import BaseDialog from '../../BaseDialog';
import DialogFooter from '../../teacherDashboard/DialogFooter';
import Button from '../../Button';

const styles = {
  description: {
    color: color.dark_charcoal
  },
  boldText: {
    fontFamily: '"Gotham 7r", sans-serif'
  },
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  textArea: {
    minHeight: 100,
    width: '95%'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  optionalText: {
    paddingLeft: 10
  }
};

class CreateStandardsReportDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleBack: PropTypes.func.isRequired
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>{i18n.createStandardsReport()}</h2>
        <div style={styles.header}>
          <h3>{i18n.createStandardsReportStep2()}</h3>
          <span style={styles.optionalText}>{i18n.optional()}</span>
        </div>
        <p>
          <SafeMarkdown markdown={i18n.createStandardsReportPrompt()} />
        </p>
        <p>
          <SafeMarkdown markdown={i18n.createStandardsReportSuggestion()} />
        </p>
        <ul>
          <li>
            <SafeMarkdown markdown={i18n.createStandardsReportSuggestion1()} />
          </li>
          <li>
            <SafeMarkdown markdown={i18n.createStandardsReportSuggestion2()} />
          </li>
          <li>
            <a href="https://studio.code.org/projects" target="_blank">
              {i18n.createStandardsReportSuggestion3()}
            </a>
          </li>
        </ul>
        <textarea
          type="text"
          value={i18n.createStandardsReportSampleNoteText()}
          onChange={() => {}}
          style={styles.textArea}
        />
        <DialogFooter>
          <Button
            text={i18n.back()}
            onClick={this.props.handleBack}
            color={Button.ButtonColor.gray}
          />
          <Button
            text={i18n.createReport()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

export const UnconnectedCreateStandardsReportDialog = CreateStandardsReportDialog;
