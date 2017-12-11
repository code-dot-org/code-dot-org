/**
 * This file contains a set of dialogs used by showDialog in dialogHelper.js to
 * create LegacyDialogs. LegacyDialog expects a semi-specific format. Eventually
 * we may be able to get away from using LegacyDialog and do this all in React.
 * These are similar to the dialogs defined in haml in _dialog.html.haml, but
 * defined using React instead.
 */

import React, { PropTypes } from 'react';
import i18n from '@cdo/locale';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';

const SingleLevelGroupDialog = ({id, title, body}) => (
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
SingleLevelGroupDialog.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
};

export const IncompleteDialog = (
  <SingleLevelGroupDialog
    id="levelgroup-submit-incomplete-dialogcontent"
    title={i18n.submitAssessment()}
    body={i18n.submittableIncomplete()}
  />
);

export const CompleteDialog = (
  <SingleLevelGroupDialog
    id="levelgroup-submit-complete-dialogcontent"
    title={i18n.submitAssessment()}
    body={i18n.submittableComplete()}
  />
);

export const UnsubmitDialog = (
  <SingleLevelGroupDialog
    id="unsubmit-dialogcontent"
    title={i18n.unsubmitAssessment()}
    body={i18n.submittableUnsubmit()}
  />
);

export const MatchAngiGifDialog = () => (
  <ProtectedStatefulDiv>
    <div className="modal-content no-modal-icon scrollable-element">
      <p className="dialog-title">{i18n.instructions()}</p>
      <p>{i18n.dragBlocksToMatch()}</p>
      <div className="aniGif example-image" style={{overflow: 'hidden'}}>
        <img src="/script_assets/images/matching_ani.gif"/>
      </div>
      <div className="farSide">
        <button id="ok-button">{i18n.ok()}</button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);

export const TooFewDialog = () => (
  <ProtectedStatefulDiv>
    <div className="modal-content no-modal-icon scrollable-element">
      <p className="dialog-title">{i18n.tooFewTitle()}</p>
      <p>{i18n.tooFewBody()}</p>
      <div className="farSide">
        <button id="ok-button">{i18n.ok()}</button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);

export const ContractMatchErrorDialog = ({text}) => (
  <ProtectedStatefulDiv>
    <div className="modal-content no-modal-icon">
      <p className="dialog-title">{i18n.incorrectAnswer()}</p>
      <p>{text}</p>
      <div className="farSide">
        <button id="ok-button">{i18n.ok()}</button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);
ContractMatchErrorDialog.propTypes = {
  text: PropTypes.string
};
