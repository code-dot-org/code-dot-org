import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import LessonTip, {
  tipTypes
} from '@cdo/apps/templates/lessonOverview/activities/LessonTip';
import _ from 'lodash';
import {tipShape} from '@cdo/apps/lib/levelbuilder/shapes';
import ConfirmDeleteButton from '../../../storage/dataBrowser/ConfirmDeleteButton';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingBottom: 20,
    paddingRight: 20,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif'
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  textArea: {
    width: '95%'
  },
  confirmDeleteButton: {
    display: 'flex',
    alignItems: 'center'
  }
};

export default class EditTipDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    tip: tipShape.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      tip: this.props.tip
    };
  }

  handleTextChange = event => {
    const newTip = _.cloneDeep(this.state.tip);
    const markdown = event.target.value;
    newTip.markdown = markdown;
    this.setState({tip: newTip});
  };

  handleTipTypeChange = event => {
    const newTip = _.cloneDeep(this.state.tip);
    const type = event.target.value;
    newTip.type = type;
    this.setState({tip: newTip});
  };

  handleCloseAndSave = () => {
    this.props.handleConfirm(this.state.tip);
  };

  handleClose = () => {
    this.props.handleConfirm();
  };

  handleDelete = () => {
    this.props.handleDelete(this.state.tip.key);
    this.props.handleConfirm();
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.handleClose}
        useUpdatedStyles
        style={styles.dialog}
      >
        <div style={styles.dialogContent}>
          <h2>Add Callout</h2>
          <select
            onChange={this.handleTipTypeChange}
            value={this.state.tip.type}
          >
            {Object.values(tipTypes).map((tipType, index) => {
              return (
                <option
                  value={Object.keys(tipTypes)[index]}
                  key={`tip-${index}`}
                >
                  {tipType.displayName}
                </option>
              );
            })}
          </select>
          <textarea
            defaultValue={this.state.tip.markdown}
            onChange={this.handleTextChange}
            style={styles.textArea}
            rows={5}
          />
          <LessonTip tip={this.state.tip} />
        </div>
        <DialogFooter>
          <ConfirmDeleteButton
            title={'Delete Callout?'}
            body={`Are you sure you want to remove the ${
              tipTypes[this.state.tip.type].displayName
            } with key "${this.state.tip.key}" from the Activity?`}
            buttonText={'Delete'}
            containerStyle={styles.confirmDeleteButton}
            onConfirmDelete={this.handleDelete}
          />
          <Button
            text={i18n.saveAndClose()}
            onClick={this.handleCloseAndSave}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
