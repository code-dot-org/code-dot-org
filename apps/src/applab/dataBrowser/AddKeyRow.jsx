/** @overview Component for adding a key/value pair row. */

import FirebaseStorage from '../firebaseStorage';
import Radium from 'radium';
import React from 'react';
import { castValue } from './dataUtils';
import * as dataStyles from './dataStyles';

const AddKeyRow = React.createClass({
  getInitialState() {
    return {
      key: '',
      value: ''
    };
  },

  handleKeyChange(event) {
    this.setState({key: event.target.value});
  },

  handleValueChange(event) {
    this.setState({value: event.target.value});
  },

  handleAdd() {
    if (this.state.key) {
      FirebaseStorage.setKeyValue(
        this.state.key,
        castValue(this.state.value),
        () => this.setState(this.getInitialState()),
        msg => console.warn(msg));
    }
  },

  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.handleAdd();
    } else if (event.key === 'Escape') {
      this.setState(this.getInitialState());
    }
  },

  render() {
    return (
      <tr style={dataStyles.row}>
        <td style={dataStyles.cell}>
          <input
            style={dataStyles.input}
            onChange={this.handleKeyChange}
            onKeyUp={this.handleKeyUp}
            placeholder="enter text"
            value={this.state.key}
          />
        </td>
        <td style={dataStyles.cell}>
          <input
            style={dataStyles.input}
            onChange={this.handleValueChange}
            onKeyUp={this.handleKeyUp}
            placeholder="enter text"
            value={this.state.value}
          />
        </td>
        <td style={dataStyles.addButtonCell}>
          <button
            style={dataStyles.blueButton}
            onClick={this.handleAdd}
          >
            Add pair
          </button>
        </td>
      </tr>
    );
  }
});

export default Radium(AddKeyRow);
