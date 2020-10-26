import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {canShowGoogleShareButton} from './googlePlatformApiRedux';
import GoogleClassroomShareButton from './GoogleClassroomShareButton';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  detailsLine: {
    marginBottom: 32
  },
  row: {
    marginTop: 8,
    marginBottom: 8
  },
  button: {
    width: 48,
    height: 48,
    margin: 0,
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
  },
  buttonLabel: {
    paddingLeft: 16
  }
};

class SendLessonDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func,
    lessonUrl: PropTypes.string.isRequired,

    // redux provided
    showGoogleButton: PropTypes.bool
  };

  renderCopyToClipboardRow() {
    return (
      <div style={styles.row}>
        <Button
          id="ui-test-copy-button"
          text=""
          icon="copy"
          iconStyle={styles.buttonIcon}
          color="white"
          style={styles.button}
          onClick={() => copyToClipboard(this.props.lessonUrl)}
        />
        <span style={styles.buttonLabel}>{i18n.sendLessonCopyLink()}</span>
      </div>
    );
  }

  renderShareToGoogleRow() {
    return (
      <div style={styles.row}>
        <GoogleClassroomShareButton height={48} url={this.props.lessonUrl} />
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

// Export unconnected dialog for unit testing
export const UnconnectedSendLessonDialog = SendLessonDialog;

export default connect(state => ({
  showGoogleButton: canShowGoogleShareButton(state)
}))(SendLessonDialog);
