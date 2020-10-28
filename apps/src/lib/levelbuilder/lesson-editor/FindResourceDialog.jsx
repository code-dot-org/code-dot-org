import PropTypes from 'prop-types';
import React, {Component} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import {connect} from 'react-redux';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif'
  }
};

// TODO: Hook up adding a resource when resources are associated with lessons

class FindResourceDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    resources: PropTypes.arrayOf(resourceShape)
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>Add Resource</h2>
        <label>
          <span>Add link to resource:</span>
          <select onChange={() => {}}>
            {this.props.resources.map(resource => (
              <option key={resource.key} value={resource.key}>
                {resource.name}
              </option>
            ))}
          </select>
        </label>
        <DialogFooter rightAlign>
          <Button
            text={'Close and Add'}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

export const UnconnectedFindResourceDialog = FindResourceDialog;

export default connect(state => ({
  resources: state.resources
}))(FindResourceDialog);
