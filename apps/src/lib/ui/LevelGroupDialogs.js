import React, { Component, PropTypes } from 'react';
import i18n from '@cdo/locale';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';

const SingleDialog = ({id, title, body}) => (
  <div id={id}>
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
  </div>
);
SingleDialog.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
};

/**
 * The way that showDialog currently works is that it is given a type (such as
 * "levelgroup-submit-incomplete") and then looks for a hidden div with the id
 * ${type}-dialogcontent. It then takes this DOM and sticks it in a LegacyDialog,
 * attaching some event handlers along the way.
 * The design/current implementation is a bit of a mess. This component is an
 * attempt to get us to a slightly cleaner state by having the initial DOM created
 * by React instead of haml.
 * Ideally, eventually we'll be able to get away from using LegacyDialog
 */

// TODO: as currently constructed, unsubmit will fail in some scenarios (as this
// is used in non-LG places). I think better solution anyways (in next commit) is
// to pass showDialog a component instead of a string for these
export default class LevelGroupDialogs extends Component {
  render() {
    return (
      <ProtectedStatefulDiv>
        <SingleDialog
          id="levelgroup-submit-incomplete-dialogcontent"
          title={i18n.submitAssessment()}
          body={i18n.submittableIncomplete()}
        />
        <SingleDialog
          id="levelgroup-submit-complete-dialogcontent"
          title={i18n.submitAssessment()}
          body={i18n.submittableComplete()}
        />
        <SingleDialog
          id="unsubmit-dialogcontent"
          title={i18n.unsubmitAssessment()}
          body={i18n.submittableUnsubmit()}
        />
      </ProtectedStatefulDiv>
    );
  }
}
