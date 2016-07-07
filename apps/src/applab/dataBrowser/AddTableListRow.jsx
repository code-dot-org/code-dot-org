import Radium from 'radium';
import React from 'react';
import msg from '../../locale';
import * as dataStyles from './dataStyles';

const AddTableListRow = React.createClass({
  propTypes: {
    onTableAdd: React.PropTypes.func.isRequired
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

  handleChange(event) {
    this.setState({newTableName: event.target.value});
  },

  render() {
    return (
      <tr style={dataStyles.addRow}>
        <td style={dataStyles.cell}>
          <input
              style={dataStyles.input}
              placeholder={msg.dataTableNamePlaceholder()}
              value={this.state.newTableName}
              onChange={this.handleChange}/>
        </td>
        <td style={dataStyles.cell}>
          <button
              className='btn btn-primary'
              style={dataStyles.button}
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
