import ConfirmDeleteButton from './ConfirmDeleteButton';
import {DataView} from '../constants';
import EditLink from './EditLink';
import FirebaseStorage from '../firebaseStorage';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import * as dataStyles from './dataStyles';

class EditTableListRow extends React.Component {
  static propTypes = {
    onViewChange: PropTypes.func.isRequired,
    tableName: PropTypes.string.isRequired,
    tableType: PropTypes.string
  };

  handleEdit = () => {
    this.props.onViewChange(DataView.TABLE, this.props.tableName);
  };

  handleDelete = () => {
    FirebaseStorage.deleteTable(this.props.tableName, this.props.tableType);
  };

  render() {
    return (
      <tr style={dataStyles.row}>
        <td style={dataStyles.cell}>
          <EditLink name={this.props.tableName} onClick={this.handleEdit} />
        </td>
        <td style={dataStyles.cell}>
          <ConfirmDeleteButton
            title="Delete table"
            body="Do you really want to delete this entire table? You cannot undo this action."
            buttonText="Delete"
            containerStyle={{whiteSpace: 'normal', width: 103}}
            onConfirmDelete={this.handleDelete}
          />
        </td>
      </tr>
    );
  }
}

export default Radium(EditTableListRow);
