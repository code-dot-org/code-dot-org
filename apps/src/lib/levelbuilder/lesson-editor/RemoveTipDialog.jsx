import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog from '@cdo/apps/templates/Dialog';
import {tipShape} from '@cdo/apps/lib/levelbuilder/shapes';
import {tipTypes} from '@cdo/apps/templates/lessonOverview/activities/LessonTip';

/**
 * Dialog which confirms removal of the tip
 */
export default class RemoveTipDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    tipToRemove: tipShape,
    handleClose: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired
  };

  render() {
    const {isOpen, handleClose, handleConfirm, tipToRemove} = this.props;
    let bodyText;
    if (tipToRemove) {
      bodyText = `Are you sure you want to remove the ${
        tipTypes[tipToRemove.type].displayName
      } with key "${tipToRemove.key}" from the Activity?`;
    }
    return (
      <Dialog
        body={bodyText}
        cancelText="Cancel"
        confirmText="Delete"
        confirmType="danger"
        isOpen={isOpen}
        handleClose={handleClose}
        onCancel={handleClose}
        onConfirm={handleConfirm}
      />
    );
  }
}
