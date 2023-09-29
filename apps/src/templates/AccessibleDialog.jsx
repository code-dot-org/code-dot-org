import PropTypes from 'prop-types';
import React from 'react';
import FocusTrap from 'focus-trap-react';
import CloseOnEscape from '@cdo/apps/templates/CloseOnEscape';
import style from './accessible-dialogue.module.scss';
import classnames from 'classnames';

const AccessibleDialog = ({
  onClose,
  children,
  className,
  initialFocus = true,
}) => (
  <>
    <div className={style.modalBackdrop} />
    <CloseOnEscape handleClose={onClose}>
      <FocusTrap focusTrapOptions={{initialFocus: initialFocus}}>
        <div
          aria-modal
          className={classnames(style.modal, className)}
          role="dialog"
        >
          {children}
        </div>
      </FocusTrap>
    </CloseOnEscape>
  </>
);

AccessibleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  initialFocus: PropTypes.bool,
};

export default AccessibleDialog;
