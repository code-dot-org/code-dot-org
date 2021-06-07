import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';

import LessonEditorDialog from './LessonEditorDialog';

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
        this.props.resources.length > 0
          ? this.props.resources[0].markdownKey
          : ''
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
      <LessonEditorDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <h2>Add Resource</h2>
        <label>
          <span>Add link to resource:</span>
          <select
            onChange={this.onResourceSelect}
            value={this.state.selectedResourceKey}
          >
            {this.props.resources.map(resource => (
              <option key={resource.key} value={resource.markdownKey}>
                {this.formatResourceName(resource)}
              </option>
            ))}
          </select>
        </label>
        <p>
          <strong>Note:</strong> Resource Links render as raw syntax (ie,{' '}
          <code>[r resource-key/course_offering_key/course_version_key]</code>)
          in the markdown preview here in the editor, but will render as
          fully-realized links in the actual lesson view.
        </p>
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
      </LessonEditorDialog>
    );
  }
}

export const UnconnectedFindResourceDialog = FindResourceDialog;

export default connect(state => ({
  resources: state.resources
}))(FindResourceDialog);
