import PropTypes from 'prop-types';
import React from 'react';
import FocusTrap from 'focus-trap-react';
import CloseOnEscape from '@cdo/apps/templates/CloseOnEscape';
import defaultStyle from './accessible-dialogue.module.scss';
import classnames from 'classnames';

function AccessibleDialog({
  styles,
  onClose,
  children,
  className,
  initialFocus = true,
}) {
  // If these styles are provided by the given stylesheet, use them
  const modalStyle = styles?.modal || defaultStyle.modal;
  const backdropStyle = styles?.modalBackdrop || defaultStyle.modalBackdrop;

  return (
    <div>
      <div className={backdropStyle} />
      <CloseOnEscape handleClose={onClose}>
        <FocusTrap focusTrapOptions={{initialFocus: initialFocus}}>
          <div
            aria-modal
            className={classnames(modalStyle, className)}
            role="dialog"
          >
            {children}
          </div>
        </FocusTrap>
      </CloseOnEscape>
    </div>
  );
}

AccessibleDialog.propTypes = {
  styles: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  initialFocus: PropTypes.bool,
};

export default AccessibleDialog;
