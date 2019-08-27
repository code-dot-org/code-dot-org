import PropTypes from 'prop-types';
import React from 'react';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import DialogFooter from '../templates/teacherDashboard/DialogFooter';
import Button from '../templates/Button';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import {actions, REDIRECT_RESPONSE} from './redux/applab';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import {BASE_DIALOG_WIDTH} from '@cdo/apps/constants';

const styles = {
  title: {
    display: 'inline',
    wordWrap: 'break-word'
  },
  url: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    maxWidth: '100%',
    wordWrap: 'break-word',
    maxHeight: '140px'
  }
};

class ExternalRedirectDialog extends React.Component {
  static propTypes = {
    handleClose: PropTypes.func,
    redirects: PropTypes.array
  };

  handleRedirect(url) {
    window.open(url, '_blank');
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
              <a target="_blank" href={studio('/report_abuse')}>
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
          />
          <Button
            onClick={() => this.handleRedirect(url)}
            text={i18n.continue()}
            color={Button.ButtonColor.orange}
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

export const UnconnectedExternalRedirectDialog = ExternalRedirectDialog;
export default connect(
  state => ({
    redirects: state.redirectDisplay
  }),
  dispatch => ({
    handleClose() {
      dispatch(actions.dismissRedirectNotice());
    }
  })
)(UnconnectedExternalRedirectDialog);
