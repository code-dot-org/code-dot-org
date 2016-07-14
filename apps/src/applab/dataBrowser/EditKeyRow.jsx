/** @overview Component for editing a key/value pair row. */

import FirebaseStorage from '../firebaseStorage';
import Radium from 'radium';
import React from 'react';
import { castValue, displayValue } from './dataUtils';
import * as dataStyles from './dataStyles';

const EditKeyRow = React.createClass({
  propTypes: {
    keyName: React.PropTypes.string.isRequired,
    value: React.PropTypes.any.isRequired
  },

  getInitialState() {
    return {
      isEditing: false
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
      this.handleError);
  },

  handleSaveComplete() {
    this.setState({isEditing: false});
  },

  handleError(msg) {
    console.warn(msg);
  },

  handleDelete() {
    FirebaseStorage.deleteKeyValue(this.props.keyName, undefined, this.handleError);
  },

  render() {
    return (
      <tr style={dataStyles.editRow}>
        <td style={dataStyles.cell}>{this.props.keyName}</td>
        <td style={dataStyles.cell}>
          {this.state.isEditing ?
            <input
              style={dataStyles.input}
              value={displayValue(this.state.newValue)}
              onChange={this.handleChange}
            /> :
            JSON.stringify(this.props.value)}
        </td>
        <td style={dataStyles.buttonCell}>
          {
            this.state.isEditing ?
              <button
                className="btn btn-primary"
                style={dataStyles.editButton}
                onClick={this.handleSave}
              >
                Save
              </button> :
              <button
                className="btn"
                style={dataStyles.editButton}
                onClick={this.handleEdit}
              >
                Edit
              </button>
          }

          <button
            className="btn btn-danger"
            style={dataStyles.button}
            onClick={this.handleDelete}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
});

export default Radium(EditKeyRow);
