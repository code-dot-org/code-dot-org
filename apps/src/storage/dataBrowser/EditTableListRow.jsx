import ConfirmDeleteButton from './ConfirmDeleteButton';
import {DataView} from '../constants';
import EditLink from './EditLink';
import PropTypes from 'prop-types';
import React from 'react';
import dataStyles from './data-styles.module.scss';
import msg from '@cdo/locale';
import {refreshCurrentDataView} from './loadDataForView';
import {storageBackend, isFirebaseStorage} from '../storage';

class EditTableListRow extends React.Component {
  static propTypes = {
    onViewChange: PropTypes.func.isRequired,
    tableName: PropTypes.string.isRequired,
    tableType: PropTypes.string,
  };

  handleEdit = () => {
    this.props.onViewChange(DataView.TABLE, this.props.tableName);
  };

  handleDelete = () => {
    if (isFirebaseStorage()) {
      storageBackend().deleteTable(
        this.props.tableName,
        this.props.tableType,
        refreshCurrentDataView
      );
    } else {
      storageBackend().deleteTable(
        this.props.tableName,
        refreshCurrentDataView
      );
    }
  };

  render() {
    return (
      <tr className={dataStyles.row}>
        <td className={dataStyles.cell}>
          <EditLink name={this.props.tableName} onClick={this.handleEdit} />
        </td>
        <td className={dataStyles.cell}>
          <ConfirmDeleteButton
            title={msg.deleteTable()}
            body={msg.deleteTableConfirm()}
            buttonText={msg.delete()}
            containerStyle={{whiteSpace: 'normal', width: 103}}
            onConfirmDelete={this.handleDelete}
          />
        </td>
      </tr>
    );
  }
}

export default EditTableListRow;
