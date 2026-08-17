import Dialog from '@code-dot-org/component-library/dialog';
import {
  Box,
  Button as MuiButton,
  Typography as MuiTypography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {studio} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

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
    if (!(this.props.redirects && this.props.redirects.length > 0)) {
      return null;
    }

    let response = this.props.redirects[0].response;
    let url = this.props.redirects[0].url;

    const title =
      response === REDIRECT_RESPONSE.APPROVED
        ? i18n.redirectTitle()
        : response === REDIRECT_RESPONSE.UNSUPPORTED
        ? i18n.redirectUnsupportedTitle()
        : i18n.redirectRejectTitle();

    return (
      <Dialog
        title={title}
        description={
          response === REDIRECT_RESPONSE.APPROVED
            ? undefined
            : response === REDIRECT_RESPONSE.UNSUPPORTED
            ? i18n.redirectUnsupportedExplanation()
            : i18n.redirectRejectExplanation()
        }
        customContent={
          response === REDIRECT_RESPONSE.APPROVED && (
            <Box>
              <MuiTypography variant="h3">
                {i18n.redirectConfirmation()}
              </MuiTypography>
              <MuiTypography variant="body2">{url}</MuiTypography>
              <MuiTypography variant="body2" sx={{mt: 1}}>
                {i18n.redirectExplanation()}
              </MuiTypography>
              <MuiButton
                color="primary"
                variant="outlined"
                size="extraSmall"
                sx={{mt: 1}}
                target="_blank"
                rel="noopener noreferrer"
                href={studio('/report_abuse')}
              >
                {i18n.reportAbuse()}
              </MuiButton>
            </Box>
          )
        }
        onClose={this.props.handleClose}
        primaryButtonProps={{
          children:
            response === REDIRECT_RESPONSE.APPROVED
              ? i18n.goBack()
              : i18n.dialogOK(),
          onClick: this.props.handleClose,
        }}
        secondaryButtonProps={
          response === REDIRECT_RESPONSE.APPROVED && {
            children: i18n.continue(),
            onClick: () => this.handleRedirect(url),
          }
        }
      />
    );
  }
}

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
