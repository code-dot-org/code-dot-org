import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {removeLevel} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import Dialog from '@cdo/apps/templates/Dialog';
import {activitySectionShape} from '@cdo/apps/lib/levelbuilder/shapes';

/**
 * Dialog which confirms removal of the level in the specified position
 * within the activity section.
 */
export class UnconnectedRemoveLevelDialog extends Component {
  static propTypes = {
    activitySection: activitySectionShape.isRequired,
    activityPosition: PropTypes.number.isRequired,
    // Position of level to remove. Dialog opens when this is set.
    levelPosToRemove: PropTypes.number,
    handleClose: PropTypes.func.isRequired,

    // provided by redux
    removeLevel: PropTypes.func.isRequired
  };

  handleConfirm = () => {
    const {
      activitySection,
      activityPosition,
      levelPosToRemove,
      removeLevel,
      handleClose
    } = this.props;
    removeLevel(activityPosition, activitySection.position, levelPosToRemove);
    handleClose();
  };

  render() {
    const {activitySection, handleClose, levelPosToRemove} = this.props;
    let bodyText;
    if (levelPosToRemove) {
      const scriptLevel = activitySection.scriptLevels[levelPosToRemove - 1];
      const levelName =
        scriptLevel.levels.length > 1
          ? scriptLevel.levels.filter(level => {
              return level.id === scriptLevel.activeId;
            })[0].name
          : scriptLevel.levels[0].name;
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
  state => ({}),
  {
    removeLevel
  }
)(UnconnectedRemoveLevelDialog);
export default RemoveLevelDialog;
