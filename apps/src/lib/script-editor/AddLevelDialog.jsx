import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif'
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'row'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    width: '30%',
    margin: 15
  },
  middleColumn: {
    display: 'flex',
    flexDirection: 'column',
    width: '30%',
    justifyContent: 'center'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    width: '30%',
    margin: 15
  },
  textArea: {
    width: '95%'
  }
};

export default class AddLevelDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    levels: PropTypes.array
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
          <div style={styles.leftColumn}>
            <select
              onClick={() => {
                console.log('select level type');
              }}
            >
              <option>App Lab</option>
              <option>Game Lab</option>
              <option>Standalone Video</option>
            </select>
            <select
              multiple={true}
              onClick={() => {
                console.log('select level');
              }}
            >
              <option>Level 1</option>
              <option>Level 2</option>
              <option>Level 4</option>
              <option>Level 5</option>
              <option>Level 6</option>
              <option>Level 8</option>
            </select>
            <Button
              text="New Level"
              onClick={() => {
                console.log('Make new level');
              }}
            />
          </div>
          <div style={styles.middleColumn}>
            <Button
              text="Add ->"
              onClick={() => {
                console.log('Add level to progression');
              }}
            />
            <Button
              text="<- Remove"
              onClick={() => {
                console.log('Remove level from progression');
              }}
            />
          </div>
          <div style={styles.rightColumn}>
            <select
              multiple={true}
              onClick={() => {
                console.log('select level');
              }}
            >
              <option>Level 3</option>
              <option>Level 7</option>
            </select>
          </div>
        </div>
        <DialogFooter rightAlign>
          <Button
            __useDeprecatedTag
            text={i18n.closeAndSave()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
