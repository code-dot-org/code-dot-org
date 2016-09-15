/** @overview Component for adding a key/value pair row. */

import FirebaseStorage from '../firebaseStorage';
import PendingButton from '../../templates/PendingButton';
import Radium from 'radium';
import React from 'react';
import { castValue } from './dataUtils';
import * as dataStyles from './dataStyles';

const AddKeyRow = React.createClass({
  getInitialState() {
    return {
      isAdding: false,
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
      this.setState({isAdding: true});
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
          <PendingButton
            isPending={this.state.isAdding}
            onClick={this.handleAdd}
            pendingText="Adding"
            style={dataStyles.blueButton}
            text="Add pair"
          />
        </td>
      </tr>
    );
  }
});

export default Radium(AddKeyRow);
