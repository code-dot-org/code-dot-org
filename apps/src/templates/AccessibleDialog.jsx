import PropTypes from 'prop-types';
import React from 'react';
import FocusTrap from 'focus-trap-react';
import CloseOnEscape from '@cdo/apps/templates/CloseOnEscape';
import style from './accessible-dialogue.module.scss';

const AccessibleDialog = ({onClose, children}) => (
  <>
    <div className={style.modalBackdrop} />
    <CloseOnEscape handleClose={onClose}>
      <FocusTrap>
        <div aria-modal role="dialog" className={style.modal}>
          {children}
        </div>
      </FocusTrap>
    </CloseOnEscape>
  </>
);

AccessibleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default AccessibleDialog;
