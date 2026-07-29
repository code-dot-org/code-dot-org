import Dialog from '@code-dot-org/component-library/dialog';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {hideShareDialog} from './shareDialogRedux';

// DSCO Dialog centers its flex container but leaves the Typography
// text-align at start. Force the title and description to center via a
// scoped selector on this dialog only.
const CENTER_TEXT_STYLE =
  '.share-disallowed-dialog h2, .share-disallowed-dialog p { text-align: center; }';

class ShareDisallowedDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    hideShareDialog: PropTypes.func.isRequired,
  };

  render() {
    if (!this.props.isOpen) {
      return null;
    }
    return (
      <>
        <style>{CENTER_TEXT_STYLE}</style>
        <Dialog
          className="share-disallowed-dialog"
          title={i18n.createAccountToShare()}
          description={i18n.createAccountToShareDescription()}
          onClose={this.props.hideShareDialog}
          closeLabel={i18n.closeDialog()}
          primaryButtonProps={{
            children: i18n.createAccount(),
            href: `/users/sign_up/account_type?user_return_to=${location.pathname}`,
          }}
          secondaryButtonProps={{
            children: i18n.cancel(),
            onClick: this.props.hideShareDialog,
          }}
        />
      </>
    );
  }
}

export const UnconnectedShareDisallowedDialog = ShareDisallowedDialog;

export default connect(
  state => ({
    isOpen: state.shareDialog.isOpen,
  }),
  {hideShareDialog}
)(ShareDisallowedDialog);
