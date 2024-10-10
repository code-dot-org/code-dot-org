import classnames from 'classnames';
import FocusTrap from 'focus-trap-react';
import PropTypes from 'prop-types';
import React from 'react';

import CloseButton from '@cdo/apps/componentLibrary/closeButton/CloseButton';
import CloseOnEscape from '@cdo/apps/templates/CloseOnEscape';
import i18n from '@cdo/locale';

import defaultStyle from './accessible-dialogue.module.scss';

function AccessibleDialog({
  id,
  styles,
  onClose,
  onDismiss,
  children,
  className,
  fallbackFocus,
  initialFocus = true,
  closeOnClickBackdrop = false,
}) {
  // If these styles are provided by the given stylesheet, use them
  const modalStyle = styles?.modal || defaultStyle.modal;
  const backdropStyle = styles?.modalBackdrop || defaultStyle.modalBackdrop;
  const closeIconStyle = styles?.xCloseButton || defaultStyle.xCloseButton;

  // This provides the option for there to be different behaviors between closing the dialog
  // and explicitly dismissing it, for example when the user has selected "remind me later".
  const xIconOnClick = onDismiss ? onDismiss : onClose;

  return (
    <div>
      <div className={backdropStyle} />
      <CloseOnEscape handleClose={onClose}>
        <FocusTrap
          focusTrapOptions={{
            initialFocus: initialFocus,
            onDeactivate: onClose,
            clickOutsideDeactivates: closeOnClickBackdrop,
            fallbackFocus: fallbackFocus,
          }}
        >
          <div
            id={id}
            aria-modal
            aria-labelledby={`${id}-title`}
            className={classnames(modalStyle, className)}
            role="dialog"
          >
            <CloseButton
              id="ui-close-dialog"
              className={closeIconStyle}
              aria-label={i18n.closeDialog()}
              onClick={xIconOnClick}
            />
            {children}
          </div>
        </FocusTrap>
      </CloseOnEscape>
    </div>
  );
}

AccessibleDialog.propTypes = {
  id: PropTypes.string,
  styles: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onDismiss: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  fallbackFocus: PropTypes.string,
  initialFocus: PropTypes.bool,
  closeOnClickBackdrop: PropTypes.bool,
};

export default AccessibleDialog;
