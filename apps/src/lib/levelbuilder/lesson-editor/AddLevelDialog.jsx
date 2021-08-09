import PropTypes from 'prop-types';
import React, {Component} from 'react';

import AddLevelDialogTop from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelDialogTop';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import LevelToken from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelToken';
import RemoveLevelDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/RemoveLevelDialog';
import i18n from '@cdo/locale';
import {activitySectionShape} from '@cdo/apps/lib/levelbuilder/shapes';

import LessonEditorDialog from './LessonEditorDialog';

export default class AddLevelDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    addLevel: PropTypes.func.isRequired,
    activityPosition: PropTypes.number.isRequired,
    activitySection: activitySectionShape.isRequired
  };

  state = {
    levelPosToRemove: null
  };

  handleRemoveLevel = levelPos => {
    this.setState({levelPosToRemove: levelPos});
  };

  handleCloseRemoveLevelDialog = () => {
    this.setState({levelPosToRemove: null});
  };

  render() {
    return (
      <LessonEditorDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        style={styles.dialog}
      >
        <h2>Add Levels</h2>
        <div
          style={styles.dialogContent}
          className="uitest-level-dialog-content"
        >
          <AddLevelDialogTop addLevel={this.props.addLevel} />
          <div style={styles.bottomArea}>
            <h4>Levels in Progression</h4>
            <div style={styles.levelsBox}>
              {this.props.activitySection.scriptLevels.map(scriptLevel => (
                <LevelToken
                  key={scriptLevel.position + '_' + scriptLevel.activeId[0]}
                  scriptLevel={scriptLevel}
                  removeLevel={this.handleRemoveLevel}
                  activitySectionPosition={this.props.activitySection.position}
                  activityPosition={this.props.activityPosition}
                />
              ))}
            </div>
          </div>
        </div>
        <RemoveLevelDialog
          activitySection={this.props.activitySection}
          activityPosition={this.props.activityPosition}
          levelPosToRemove={this.state.levelPosToRemove}
          handleClose={this.handleCloseRemoveLevelDialog}
        />
        <DialogFooter rightAlign>
          <Button
            text={i18n.closeAndSave()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
            className="save-add-levels-button"
          />
        </DialogFooter>
      </LessonEditorDialog>
    );
  }
}

const styles = {
  dialog: {
    width: 970,
    marginLeft: -500
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  topArea: {
    display: 'flex',
    flexDirection: 'column',
    margin: 15
  },
  bottomArea: {
    display: 'flex',
    flexDirection: 'column',
    margin: 15
  },
  textArea: {
    width: '95%'
  },
  levelsBox: {
    border: '1px solid black',
    width: '95%',
    height: '100%',
    padding: 10
  },
  filtersAndLevels: {
    display: 'flex',
    flexDirection: 'column'
  }
};
