/**
 * This file contains a set of dialogs used by showDialog in dialogHelper.js to
 * create LegacyDialogs. LegacyDialog expects a semi-specific format.
 */

import React, { PropTypes } from 'react';
import i18n from '@cdo/locale';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';

export const SingleLevelGroupDialog = ({id, title, body}) => (
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

export const MatchErrorDialog = () => (
  <ProtectedStatefulDiv>
    <div className="modal-content no-modal-icon scrollable-element">
      <p className="dialog-title">{i18n.incorrectSolution()}</p>
      <p>{i18n.incorrectSolutionBody()}</p>
      <div className="farSide">
        <button id="ok-button">{i18n.ok()}</button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);

export const ErrorDialog = () => (
  <ProtectedStatefulDiv>
    <div className="modal-content no-modal-icon scrollable-element">
      <p className="dialog-title">{i18n.incorrectAnswer()}</p>
      <p>{i18n.incorrectAnswerBody()}</p>
      <div className="farSide">
        <button id="ok-button">{i18n.ok()}</button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);

export const StartOverDialog = () => (
  <ProtectedStatefulDiv>
    <div className="modal-content no-modal-icon scrollable-element">
      <p className="dialog-title">{i18n.startOverTitle()}</p>
      <p>{i18n.startOverBody()}</p>
      <div id="buttons">
        <button id="cancel-button">
          {i18n.cancel()}
        </button>
        <button id="ok-button" className="btn-danger" style={{float: 'right'}}>
          {i18n.startOver()}
        </button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);

/* eslint-disable react/no-danger */
export const InstructionsDialog = ({title, markdownContent}) => (
  <ProtectedStatefulDiv>
    <div className="modal-content no-modal-icon markdown-instructions-container">
      <p className="dialog-title">{title}</p>
      <p/>
      <div
        className="instructions-markdown scrollable-element"
        dangerouslySetInnerHTML={{ __html: markdownContent }}
      />
      <div id="buttons">
        <button id="ok-button" style={{float: 'right'}}>
          {i18n.ok()}
        </button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);
InstructionsDialog.propTypes = {
  title: PropTypes.string.isRequired,
  markdownContent: PropTypes.string.isRequired,
};

export const SuccessDialog = ({title, body}) => (
  <ProtectedStatefulDiv>
    <div className="modal-content no-modal-icon scrollable-element">
      <p className="dialog-title">{title}</p>
      <p>{body}</p>
      <div className="farSide">
        <button id="ok-button">{i18n.ok()}</button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);
SuccessDialog.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
};
