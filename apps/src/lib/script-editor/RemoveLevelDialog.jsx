import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {removeLevel} from './editorRedux';
import Dialog from '../../templates/Dialog';

/**
 * Dialog which confirms removal of the level in the specified position
 * within the stage.
 */
export class UnconnectedRemoveLevelDialog extends Component {
  static propTypes = {
    stage: PropTypes.object.isRequired,
    // Position of level to remove. Dialog opens when this is set.
    levelPosToRemove: PropTypes.number,
    handleClose: PropTypes.func.isRequired,

    // provided by redux
    removeLevel: PropTypes.func.isRequired,
    levelKeyList: PropTypes.object.isRequired
  };

  handleConfirm = () => {
    const {stage, levelPosToRemove, removeLevel, handleClose} = this.props;
    removeLevel(stage.position, levelPosToRemove);
    handleClose();
  };

  render() {
    const {stage, handleClose, levelPosToRemove} = this.props;
    let bodyText;
    if (levelPosToRemove) {
      const levelId = stage.levels[levelPosToRemove - 1].activeId;
      const levelName = this.props.levelKeyList[levelId];
      bodyText = `Are you sure you want to remove the level named "${levelName}" from the script?`;
    }
    return (
      <Dialog
        body={bodyText}
        cancelText="Cancel"
        confirmText="Delete"
        confirmType="danger"
        isOpen={!!levelPosToRemove}
        handleClose={handleClose}
        onCancel={handleClose}
        onConfirm={this.handleConfirm}
      />
    );
  }
}

const RemoveLevelDialog = connect(
  state => ({
    levelKeyList: state.levelKeyList
  }),
  {
    removeLevel
  }
)(UnconnectedRemoveLevelDialog);
export default RemoveLevelDialog;
