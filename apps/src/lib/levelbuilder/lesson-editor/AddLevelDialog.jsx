import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import LevelToken from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelToken';
import AddLevelDialogTop from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelDialogTop';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    width: 1100,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif',
    marginLeft: -600
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

export default class AddLevelDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    currentScriptLevels: PropTypes.array,
    addLevel: PropTypes.func,
    activityPosition: PropTypes.number,
    activitySectionPosition: PropTypes.number
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>Add Levels</h2>
        <div style={styles.dialogContent}>
          <AddLevelDialogTop addLevel={this.props.addLevel} />
          <div style={styles.bottomArea}>
            <h4>Levels in Progression</h4>
            <div style={styles.levelsBox}>
              {/*TODO Hook up removeLevel for the addLevelDialog*/}
              {this.props.currentScriptLevels.map(scriptLevel => (
                <LevelToken
                  key={scriptLevel.position + '_' + scriptLevel.activeId[0]}
                  scriptLevel={scriptLevel}
                  removeLevel={() => {
                    console.log('remove level');
                  }}
                  activitySectionPosition={this.props.activitySectionPosition}
                  activityPosition={this.props.activityPosition}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter rightAlign>
          <Button
            text={i18n.closeAndSave()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
