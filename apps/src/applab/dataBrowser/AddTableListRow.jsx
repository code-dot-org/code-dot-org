import { DataView } from '../constants';
import Radium from 'radium';
import React from 'react';
import msg from '@cdo/locale';
import * as dataStyles from './dataStyles';

const AddTableListRow = React.createClass({
  propTypes: {
    onTableAdd: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      newTableName: ''
    };
  },

  handleAdd() {
    if (this.state.newTableName) {
      this.props.onTableAdd(this.state.newTableName);
      this.setState(this.getInitialState());
    }
  },

  handleInputChange(event) {
    this.setState({newTableName: event.target.value});
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
            placeholder={msg.dataTableNamePlaceholder()}
            value={this.state.newTableName}
            onChange={this.handleInputChange}
            onKeyUp={this.handleKeyUp}
          />
        </td>
        <td style={dataStyles.cell}>
          <button
            style={dataStyles.blueButton}
            onClick={this.handleAdd}
          >
            Add
          </button>
        </td>
      </tr>
    );
  }
});

export default Radium(AddTableListRow);
