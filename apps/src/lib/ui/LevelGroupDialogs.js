/**
 * This file contains a set of dialogs used by level groups (and in the case of
 * unsubmit, possibly some other places). These dialogs are used by showDialog in
 * dialogHelper.js to create LegacyDialogs. They are similar to the dialogs defined
 * in haml in _dialog.html.haml, but defined using React instead.
 */

import React, { PropTypes } from 'react';
import i18n from '@cdo/locale';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';

const SingleDialog = ({id, title, body}) => (
  <ProtectedStatefulDiv id={id}>
    <div className="modal-content no-modal-icon">
      <p className="dialog-title">{title}</p>
      <p className="dialog-body">{body}</p>
      <button id="cancel-button" style={{float: 'left'}}>
        {i18n.cancel()}
      </button>
      <button id="ok-button" style={{float: 'right'}}>
        {i18n.okay()}
      </button>
    </div>
  </ProtectedStatefulDiv>
);
SingleDialog.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
};

export const IncompleteDialog = (
  <SingleDialog
    id="levelgroup-submit-incomplete-dialogcontent"
    title={i18n.submitAssessment()}
    body={i18n.submittableIncomplete()}
  />
);

export const CompleteDialog = (
  <SingleDialog
    id="levelgroup-submit-complete-dialogcontent"
    title={i18n.submitAssessment()}
    body={i18n.submittableComplete()}
  />
);

export const UnsubmitDialog = (
  <SingleDialog
    id="unsubmit-dialogcontent"
    title={i18n.unsubmitAssessment()}
    body={i18n.submittableUnsubmit()}
  />
);
