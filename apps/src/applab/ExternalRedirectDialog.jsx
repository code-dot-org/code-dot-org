import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {BASE_DIALOG_WIDTH} from '@cdo/apps/constants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import Dialog, {Body} from '@cdo/apps/legacySharedComponents/Dialog';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

import DialogFooter from '../templates/teacherDashboard/DialogFooter';

import {actions, REDIRECT_RESPONSE} from './redux/applab';

class ExternalRedirectDialog extends React.Component {
  static propTypes = {
    handleClose: PropTypes.func,
    redirects: PropTypes.array,
  };

  handleRedirect(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    this.props.handleClose();
  }

  render() {
    let title, body, footer;
    if (!(this.props.redirects && this.props.redirects.length > 0)) {
      return null;
    }

    let response = this.props.redirects[0].response;
    let url = this.props.redirects[0].url;
    if (response === REDIRECT_RESPONSE.APPROVED) {
      title = i18n.redirectTitle();
      body = (
        <div>
          <h2 style={styles.title}>{i18n.redirectConfirmation()}</h2>
          <p style={styles.url}>{url}</p>
          <p>
            {i18n.redirectExplanation()}
            <span>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={studio('/report_abuse')}
              >
                {i18n.reportAbuse()}
              </a>
            </span>
          </p>
        </div>
      );
      footer = (
        <DialogFooter>
          <Button
            onClick={this.props.handleClose}
            text={i18n.goBack()}
            color={Button.ButtonColor.gray}
            style={{margin: 0}}
          />
          <Button
            onClick={() => this.handleRedirect(url)}
            text={i18n.continue()}
            color={Button.ButtonColor.brandSecondaryDefault}
            style={{margin: 0}}
          />
        </DialogFooter>
      );
    } else {
      if (response === REDIRECT_RESPONSE.UNSUPPORTED) {
        title = i18n.redirectUnsupportedTitle();
        body = <p>{i18n.redirectUnsupportedExplanation()}</p>;
      } else {
        title = i18n.redirectRejectTitle();
        body = <p>{i18n.redirectRejectExplanation()}</p>;
      }
      footer = (
        <DialogFooter rightAlign>
          <Button
            __useDeprecatedTag
            onClick={this.props.handleClose}
            text={i18n.dialogOK()}
            color={Button.ButtonColor.gray}
          />
        </DialogFooter>
      );
    }

    return (
      <Dialog
        title={title}
        fullWidth={window.innerWidth < BASE_DIALOG_WIDTH}
        isOpen
        handleClose={this.props.handleClose}
      >
        <Body>
          {body}
          {footer}
        </Body>
      </Dialog>
    );
  }
}

const styles = {
  title: {
    display: 'inline',
    wordWrap: 'break-word',
  },
  url: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    maxWidth: '100%',
    wordWrap: 'break-word',
    maxHeight: '140px',
  },
};

export const UnconnectedExternalRedirectDialog = ExternalRedirectDialog;
export default connect(
  state => ({
    redirects: state.redirectDisplay,
  }),
  dispatch => ({
    handleClose() {
      dispatch(actions.dismissRedirectNotice());
    },
  })
)(UnconnectedExternalRedirectDialog);
