import React, {Component} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';

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
    // use longhand properties for border radius and padding to properly
    // override the longhand properties in Button
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingLeft: 0,
    paddingRight: 0
  },
  buttonIcon: {
    margin: 0,
    fontSize: 24
  }
};

export default class SendLessonDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func,
    showGoogleButton: PropTypes.bool
  };

  renderCopyToClipboardRow() {
    return (
      <div>
        <Button
          text=""
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
          text=""
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
}
