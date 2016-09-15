/** @overview Component for editing a key/value pair row. */

import FirebaseStorage from '../firebaseStorage';
import FontAwesome from '../../templates/FontAwesome';
import Radium from 'radium';
import React from 'react';
import PendingButton from '../../templates/PendingButton';
import { castValue, displayableValue, editableValue } from './dataUtils';
import * as dataStyles from './dataStyles';

const EditKeyRow = React.createClass({
  propTypes: {
    keyName: React.PropTypes.string.isRequired,
    value: React.PropTypes.any
  },

  getInitialState() {
    return {
      isDeleting: false,
      isEditing: false,
      isSaving: false,
      newValue: undefined
    };
  },

  handleChange(event) {
    this.setState({newValue: castValue(event.target.value)});
  },

  handleEdit() {
    this.setState({
      isEditing: true,
      newValue: this.props.value
    });
  },

  handleSave() {
    this.setState({isSaving: true});
    FirebaseStorage.setKeyValue(
      this.props.keyName,
      this.state.newValue,
      this.resetState,
      msg => console.warn(msg));
  },

  resetState() {
    this.setState(this.getInitialState());
  },

  handleDelete() {
    this.setState({isDeleting: true});
    FirebaseStorage.deleteKeyValue(
      this.props.keyName,
      this.resetState,
      msg => console.warn(msg));
  },

  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.handleSave();
    } else if (event.key === 'Escape') {
      this.setState(this.getInitialState());
    }
  },

  render() {
    return (
      <tr style={dataStyles.row}>
        <td style={dataStyles.cell}>{this.props.keyName}</td>
        <td style={dataStyles.cell}>
          {this.state.isEditing ?
            <input
              style={dataStyles.input}
              value={editableValue(this.state.newValue)}
              onChange={this.handleChange}
              onKeyUp={this.handleKeyUp}
            /> :
            displayableValue(this.props.value)}
        </td>
        <td style={dataStyles.editButtonCell}>
          {
            !this.state.isDeleting && (
              this.state.isEditing ?
                <PendingButton
                  isPending={this.state.isSaving}
                  onClick={this.handleSave}
                  pendingText="Saving..."
                  style={dataStyles.saveButton}
                  text="Save"
                /> :
                <button
                  style={dataStyles.editButton}
                  onClick={this.handleEdit}
                >
                  Edit
                </button>
            )
          }

          {
            !this.state.isSaving && (
              <PendingButton
                isPending={this.state.isDeleting}
                onClick={this.handleDelete}
                pendingStyle={{float: 'right'}}
                pendingText="Deleting..."
                style={dataStyles.redButton}
                text="Delete"
              />
            )
          }
        </td>
      </tr>
    );
  }
});

export default Radium(EditKeyRow);
