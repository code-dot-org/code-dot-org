import Dialog from '@code-dot-org/component-library/dialog';
import PropTypes from 'prop-types';
import React from 'react';

import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

const RedirectDialog = ({
  isOpen,
  details,
  handleClose,
  redirectUrl,
  redirectButtonText,
}) => {
  if (!isOpen) {
    return null;
  }

  const redirect = () => {
    navigateToHref(redirectUrl);
  };

  return (
    <Dialog
      title={i18n.notInRightPlace()}
      customContent={<div id="dsco-dialog-description">{details}</div>}
      onClose={handleClose}
      primaryButtonProps={{
        children: redirectButtonText,
        onClick: redirect,
        size: 'small',
        color: 'primary',
        type: 'button',
      }}
      secondaryButtonProps={{
        children: i18n.stayHere(),
        onClick: handleClose,
        size: 'small',
        color: 'tertiary',
        variant: 'outlined',
        type: 'button',
      }}
    />
  );
};

RedirectDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  details: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  redirectUrl: PropTypes.string.isRequired,
  redirectButtonText: PropTypes.string.isRequired,
};

export default RedirectDialog;
