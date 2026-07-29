import Dialog from '@code-dot-org/component-library/dialog';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {hideShareDialog} from './shareDialogRedux';

import moduleStyles from './share-disallowed-dialog.module.scss';

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
      <Dialog
        className={moduleStyles.dialog}
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
