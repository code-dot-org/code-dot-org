import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {canShowGoogleShareButton} from './googlePlatformApiRedux';
import GoogleClassroomShareButton from './GoogleClassroomShareButton';

class SendLessonDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func,
    lessonUrl: PropTypes.string.isRequired,
    lessonTitle: PropTypes.string,
    courseid: PropTypes.number,
    analyticsData: PropTypes.string,

    // redux provided
    showGoogleButton: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.onCopyLink = this.onCopyLink.bind(this);
    this.state = {
      showLinkCopied: false
    };
  }

  onCopyLink() {
    copyToClipboard(this.props.lessonUrl);

    // show message "Link copied!" for 4 seconds
    this.setState({showLinkCopied: true});
    setTimeout(() => {
      this.setState({showLinkCopied: false});
    }, 4000);

    firehoseClient.putRecord(
      {
        study: 'copy-lesson-link-button',
        study_group: 'v0',
        event: event,
        data_json: this.props.analyticsData
      },
      {includeUserId: true}
    );
  }

  renderCopyToClipboardRow() {
    return (
      <div style={styles.row}>
        <Button
          id="uitest-copy-button"
          text=""
          icon="link"
          iconStyle={styles.buttonIcon}
          color={Button.ButtonColor.blue}
          style={styles.button}
          onClick={this.onCopyLink}
        />
        <span style={styles.buttonLabel}>
          {this.state.showLinkCopied
            ? i18n.sendLessonLinkCopied()
            : i18n.sendLessonCopyLink()}
        </span>
      </div>
    );
  }

  renderShareToGoogleRow() {
    return (
      <div style={styles.row}>
        <GoogleClassroomShareButton
          theme="classic"
          height={styles.button.height}
          url={this.props.lessonUrl}
          itemtype="assignment"
          title={this.props.lessonTitle}
          courseid={this.props.courseid}
          analyticsData={this.props.analyticsData}
        />
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
            rel="noopener noreferrer"
            href="https://support.code.org/hc/en-us/articles/360051654691"
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

const styles = {
  dialog: {
    textAlign: 'left',
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

// Export unconnected dialog for unit testing
export const UnconnectedSendLessonDialog = SendLessonDialog;

export default connect(state => ({
  showGoogleButton: canShowGoogleShareButton(state)
}))(SendLessonDialog);
