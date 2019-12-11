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
  }
};

class StandardsIntroDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>{i18n.progressOnCSTAStandards()}</h2>
        <div style={styles.description}>
          <p>
            {i18n.progressOnCSTAStandardsDescription()}{' '}
            <a
              href="https://www.csteachers.org/page/standards"
              target="_blank"
              style={styles.boldText}
            >
              {i18n.CSTAStandards()}
            </a>
          </p>
        </div>
        <div style={styles.description}>
          <p>{i18n.useToView()}</p>
          <ul>
            <li>
              <SafeMarkdown markdown={i18n.useToViewList1()} />
            </li>
            <li>
              <SafeMarkdown markdown={i18n.useToViewList2()} />
            </li>
            <li>
              <SafeMarkdown markdown={i18n.useToViewList3()} />
            </li>
          </ul>
        </div>
        <div style={styles.description}>
          <p>
            <SafeMarkdown markdown={i18n.standardsReminder()} />
          </p>
        </div>
        <DialogFooter rightAlign>
          <Button
            text={i18n.gotIt()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
            className="no-mc"
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

export const UnconnectedStandardsIntroDialog = StandardsIntroDialog;
