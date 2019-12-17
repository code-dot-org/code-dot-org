import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import Button from '../../Button';
import DialogFooter from '../../teacherDashboard/DialogFooter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const styles = {
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

export class CreateStandardsReportStep2 extends Component {
  static propTypes = {
    onBack: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
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
            onClick={this.props.onBack}
            color={Button.ButtonColor.gray}
          />
          <Button
            text={i18n.createReport()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </div>
    );
  }
}

export const UnconnectedCreateStandardsReportStep2 = CreateStandardsReportStep2;
