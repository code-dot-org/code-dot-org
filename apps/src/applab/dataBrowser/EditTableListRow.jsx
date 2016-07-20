import { DataView } from '../constants';
import EditLink from './EditLink';
import FirebaseStorage from '../firebaseStorage';
import Radium from 'radium';
import React from 'react';
import * as dataStyles from './dataStyles';

const EditTableListRow = React.createClass({
  propTypes: {
    onTableDelete: React.PropTypes.func.isRequired,
    onViewChange: React.PropTypes.func.isRequired,
    tableName: React.PropTypes.string.isRequired
  },

  handleEdit() {
    this.props.onViewChange(DataView.TABLE, this.props.tableName);
  },

  handleDelete() {
    if (confirm('Do you really want to delete this entire table? You cannot undo this action.')) {
      this.props.onTableDelete(this.props.tableName);
      FirebaseStorage.deleteTable(this.props.tableName);
    }
  },

  render() {
    return (
      <tr style={dataStyles.editRow}>
        <td style={dataStyles.cell}>
          <EditLink name={this.props.tableName} onClick={this.handleEdit}/>
        </td>
        <td style={dataStyles.cell}>
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

export default Radium(EditTableListRow);
