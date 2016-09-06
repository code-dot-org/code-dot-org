/** @overview Component for editing a key/value pair row. */

import FirebaseStorage from '../firebaseStorage';
import Radium from 'radium';
import React from 'react';
import { castValue, displayableValue, editableValue } from './dataUtils';
import * as dataStyles from './dataStyles';

const EditKeyRow = React.createClass({
  propTypes: {
    keyName: React.PropTypes.string.isRequired,
    value: React.PropTypes.any
  },

  getInitialState() {
    return {
      isEditing: false,
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
    FirebaseStorage.setKeyValue(
      this.props.keyName,
      this.state.newValue,
      this.handleSaveComplete,
      msg => console.warn(msg));
  },

  handleSaveComplete() {
    this.setState({isEditing: false});
  },

  handleDelete() {
    FirebaseStorage.deleteKeyValue(this.props.keyName, undefined, msg => console.warn(msg));
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
            this.state.isEditing ?
              <button
                style={dataStyles.saveButton}
                onClick={this.handleSave}
              >
                Save
              </button> :
              <button
                style={dataStyles.editButton}
                onClick={this.handleEdit}
              >
                Edit
              </button>
          }

          <button
            style={dataStyles.redButton}
            onClick={this.handleDelete}
            onKeyUp={this.handleKeyUp}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
});

export default Radium(EditKeyRow);
