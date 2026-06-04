import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import Modal from '@code-dot-org/component-library/modal';
import {
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import i18n from '@cdo/locale';

import GoogleClassroomShareButton from './GoogleClassroomShareButton';
import {canShowGoogleShareButton} from './googlePlatformApiRedux';

class SendLessonDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func,
    lessonUrl: PropTypes.string.isRequired,
    lessonTitle: PropTypes.string,
    courseid: PropTypes.number,

    // redux provided
    showGoogleButton: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.onCopyLink = this.onCopyLink.bind(this);
    this.state = {
      showLinkCopied: false,
    };
  }

  onCopyLink() {
    copyToClipboard(this.props.lessonUrl);

    // show message "Link copied!" for 4 seconds
    this.setState({showLinkCopied: true});
    setTimeout(() => {
      this.setState({showLinkCopied: false});
    }, 4000);
  }

  renderCopyToClipboardRow() {
    return (
      <div style={styles.row}>
        <MuiIconButton
          id="uitest-copy-button"
          aria-label={i18n.sendLessonCopyLink()}
          onClick={this.onCopyLink}
          color="secondary"
          variant="outlined"
        >
          <FontAwesomeV6Icon iconName="link" />
        </MuiIconButton>
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
          height={48}
          url={this.props.lessonUrl}
          itemtype="assignment"
          title={this.props.lessonTitle}
          courseid={this.props.courseid}
        />
      </div>
    );
  }

  render() {
    if (!this.props.isOpen) {
      return null;
    }
    return (
      <Modal
        onClose={this.props.handleClose}
        title={i18n.sendLessonTitle()}
        customContent={
          <>
            <MuiTypography
              id="dsco-dialog-description"
              variant="body3"
              style={styles.detailsLine}
            >
              {i18n.sendLessonDetails()}{' '}
              <Link
                openInNewTab
                size="s"
                href="https://support.code.org/hc/en-us/articles/360051654691"
                text={i18n.learnMore()}
              />
            </MuiTypography>
            {this.renderCopyToClipboardRow()}
            {this.props.showGoogleButton && this.renderShareToGoogleRow()}
          </>
        }
        primaryButtonProps={{
          onClick: this.props.handleClose,
          children: i18n.done(),
          variant: 'outlined',
          color: 'secondary',
        }}
      />
    );
  }
}

const styles = {
  detailsLine: {
    marginTop: 10,
    marginInlineStart: 5,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginInlineStart: 5,
    marginTop: 8,
    marginBottom: 8,
  },
  copyButton: {
    width: 48,
    height: 48,
    borderRadius: 0,
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    '&:hover': {backgroundColor: 'primary.dark'},
  },
  buttonLabel: {
    paddingLeft: 16,
  },
};

// Export unconnected dialog for unit testing
export const UnconnectedSendLessonDialog = SendLessonDialog;

export default connect(state => ({
  showGoogleButton: canShowGoogleShareButton(state),
}))(SendLessonDialog);
