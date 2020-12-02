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

class FindResourceDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    resources: PropTypes.arrayOf(resourceShape)
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedResourceKey:
        this.props.resources.length > 0 ? this.props.resources[0].key : ''
    };
  }

  onResourceSelect = e => {
    this.setState({selectedResourceKey: e.target.value});
  };

  formatResourceName = resource => {
    let formattedName = resource.name;
    if (resource.type) {
      formattedName += ` - ${resource.type}`;
    }
    return formattedName;
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>Add Resource</h2>
        <label>
          <span>Add link to resource:</span>
          <select
            onChange={this.onResourceSelect}
            value={this.state.selectedResourceKey}
          >
            {this.props.resources.map(resource => (
              <option key={resource.key} value={resource.key}>
                {this.formatResourceName(resource)}
              </option>
            ))}
          </select>
        </label>
        <DialogFooter rightAlign>
          <Button
            text={'Close and Add'}
            onClick={e => {
              e.preventDefault();
              this.props.handleConfirm(this.state.selectedResourceKey);
            }}
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
