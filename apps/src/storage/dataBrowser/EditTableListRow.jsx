import ConfirmDeleteButton from './ConfirmDeleteButton';
import { DataView } from '../constants';
import EditLink from './EditLink';
import FirebaseStorage from '../firebaseStorage';
import Radium from 'radium';
import React from 'react';
import * as dataStyles from './dataStyles';

const EditTableListRow = React.createClass({
  propTypes: {
    onViewChange: React.PropTypes.func.isRequired,
    tableName: React.PropTypes.string.isRequired
  },

  handleEdit() {
    this.props.onViewChange(DataView.TABLE, this.props.tableName);
  },

  handleDelete() {
    FirebaseStorage.deleteTable(this.props.tableName);
  },

  render() {
    return (
      <tr style={dataStyles.row}>
        <td style={dataStyles.cell}>
          <EditLink name={this.props.tableName} onClick={this.handleEdit}/>
        </td>
        <td style={dataStyles.cell}>
          <ConfirmDeleteButton
            title="Delete table"
            body="Do you really want to delete this entire table? You cannot undo this action."
            buttonText="Delete"
            containerStyle={{whiteSpace: 'normal', width: 103}}
            onConfirm={this.handleDelete}
          />
        </td>
      </tr>
    );
  }
});

export default Radium(EditTableListRow);
