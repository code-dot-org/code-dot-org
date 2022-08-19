/**
 * This file contains a set of dialogs used to create LegacyDialogs.
 * LegacyDialog expects a semi-specific format.
 */

import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export const LegacySingleLevelGroupDialog = ({id, title, body}) => (
  <ProtectedStatefulDiv id={id}>
    <div className="modalContent noModalIcon">
      <p className="dialogTitle">{title}</p>
      <p className="dialog-body">{body}</p>
      <button type="button" id="cancel-button" style={{float: 'left'}}>
        {i18n.cancel()}
      </button>
      <button type="button" id="ok-button" style={{float: 'right'}}>
        {i18n.okay()}
      </button>
    </div>
  </ProtectedStatefulDiv>
);
LegacySingleLevelGroupDialog.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired
};

export const LegacyUnsubmitDialog = (
  <LegacySingleLevelGroupDialog
    id="unsubmit-dialogcontent"
    title={i18n.unsubmitAssessment()}
    body={i18n.submittableUnsubmit()}
  />
);

export const LegacyMatchAngiGifDialog = () => (
  <ProtectedStatefulDiv>
    <div className="modalContent noModalIcon scrollable-element">
      <p className="dialogTitle">{i18n.instructions()}</p>
      <p>{i18n.dragBlocksToMatch()}</p>
      <div className="aniGif example-image" style={{overflow: 'hidden'}}>
        <img src="/script_assets/images/matching_ani.gif" />
      </div>
      <div className="farSide">
        <button type="button" id="ok-button">
          {i18n.ok()}
        </button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);

export const LegacyTooFewDialog = () => (
  <ProtectedStatefulDiv>
    <div className="modalContent noModalIcon scrollable-element">
      <p className="dialogTitle">{i18n.tooFewTitle()}</p>
      <p>{i18n.tooFewBody()}</p>
      <div className="farSide">
        <button type="button" id="ok-button">
          {i18n.ok()}
        </button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);

export const LegacyContractMatchErrorDialog = ({text}) => (
  <ProtectedStatefulDiv>
    <div className="modalContent noModalIcon">
      <p className="dialogTitle">{i18n.incorrectAnswer()}</p>
      <p>{text}</p>
      <div className="farSide">
        <button type="button" id="ok-button">
          {i18n.ok()}
        </button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);
LegacyContractMatchErrorDialog.propTypes = {
  text: PropTypes.string
};

export const LegacyMatchErrorDialog = () => (
  <ProtectedStatefulDiv>
    <div className="modalContent noModalIcon scrollable-element">
      <p className="dialogTitle">{i18n.incorrectSolution()}</p>
      <p>{i18n.incorrectSolutionBody()}</p>
      <div className="farSide">
        <button type="button" id="ok-button">
          {i18n.ok()}
        </button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);

export const LegacyErrorDialog = () => (
  <ProtectedStatefulDiv>
    <div className="modalContent noModalIcon scrollable-element">
      <p className="dialogTitle">{i18n.incorrectAnswer()}</p>
      <p>{i18n.incorrectAnswerBody()}</p>
      <div className="farSide">
        <button type="button" id="ok-button">
          {i18n.ok()}
        </button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);

export const LegacyStartOverDialog = () => (
  <ProtectedStatefulDiv>
    <div className="modalContent noModalIcon scrollable-element">
      <p className="dialogTitle">{i18n.startOverTitle()}</p>
      <p>{i18n.startOverBody()}</p>
      <div id="buttons">
        <button type="button" id="cancel-button">
          {i18n.cancel()}
        </button>
        <button
          type="button"
          id="ok-button"
          className="btn-danger"
          style={{float: 'right'}}
        >
          {i18n.startOver()}
        </button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);

export const LegacyInstructionsDialog = ({title, markdown}) => (
  <ProtectedStatefulDiv>
    <div className="modalContent noModalIcon markdown-instructions-container">
      <p className="dialogTitle">{title}</p>
      <p />
      <div className="instructionsMarkdown scrollable-element">
        <SafeMarkdown markdown={markdown} />
      </div>
      <div id="buttons">
        <button type="button" id="ok-button" style={{float: 'right'}}>
          {i18n.ok()}
        </button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);
LegacyInstructionsDialog.propTypes = {
  title: PropTypes.string.isRequired,
  markdown: PropTypes.string.isRequired
};

export const LegacySuccessDialog = ({title, body}) => (
  <ProtectedStatefulDiv>
    <div className="modalContent noModalIcon scrollable-element">
      <p className="dialogTitle">{title}</p>
      <p>{body}</p>
      <div className="farSide">
        <button type="button" id="ok-button">
          {i18n.ok()}
        </button>
      </div>
    </div>
  </ProtectedStatefulDiv>
);
LegacySuccessDialog.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired
};
