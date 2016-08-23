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
    FirebaseStorage.setKeyValue(
      this.state.key,
      castValue(this.state.value),
      () => this.setState(this.getInitialState()),
      msg => console.warn(msg));
  },

  render() {
    return (
      <tr style={dataStyles.row}>
        <td style={dataStyles.cell}>
          <input
            style={dataStyles.input}
            onChange={this.handleKeyChange}
            placeholder="enter text"
            value={this.state.key}
          />
        </td>
        <td style={dataStyles.cell}>
          <input
            style={dataStyles.input}
            onChange={this.handleValueChange}
            placeholder="enter text"
            value={this.state.value}
          />
        </td>
        <td style={dataStyles.buttonCell}>
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
