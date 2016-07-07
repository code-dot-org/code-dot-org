import { DataView } from '../constants';
import DeleteElementButton from '../designElements/DeleteElementButton';
import EditLink from './EditLink';
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
    this.props.onTableDelete(this.props.tableName);
  },

  render() {
    return (
      <tr style={dataStyles.editRow}>
        <td style={dataStyles.cell}>
          <EditLink name={this.props.tableName} onClick={this.handleEdit}/>
        </td>
        <td style={dataStyles.deleteTableCell}>
          <DeleteElementButton
            shouldConfirm={true}
            handleDelete={this.handleDelete}/>
        </td>
      </tr>
    );
  }
});

export default Radium(EditTableListRow);
