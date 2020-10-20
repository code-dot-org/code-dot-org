import React, {Component} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';

export default class SendLessonDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    showGoogleButton: PropTypes.bool
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
        style={styles.dialog}
        useUpdatedStyles
      >
        <h2>{i18n.sendLessonTitle()}</h2>
        <div style={styles.detailsLine}>
          {i18n.sendLessonDetails()}{' '}
          <a
            target="_blank"
            href="https://support.code.org/" // TODO: Update this!
          >
            {i18n.learnMore()}
          </a>
        </div>
        {this.renderCopyToClipboardRow()}
        {this.props.showGoogleButton && this.renderShareToGoogleRow()}
        <DialogFooter>
          <Button
            text={i18n.done()}
            onClick={this.props.handleClose}
            color={Button.ButtonColor.gray}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }

  renderCopyToClipboardRow() {
    return (
      <div>
        <Button
          icon="copy"
          iconStyle={styles.buttonIcon}
          color="white"
          style={styles.button}
          onClick={() => {}} // TODO: Implement this!
        />
        {i18n.sendLessonCopyLink()}
      </div>
    );
  }

  renderShareToGoogleRow() {
    return (
      <div>
        {/* TODO: Replace placeholder button with actual implementation */}
        <Button
          icon="users"
          iconStyle={styles.buttonIcon}
          color="white"
          style={styles.button}
          onClick={() => {}}
        />
        {i18n.sendLessonShareToGoogle()}
      </div>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  detailsLine: {
    marginBottom: 25
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 0,
    padding: 0
  },
  buttonIcon: {
    margin: 0,
    fontSize: 24
  }
};
