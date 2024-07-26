import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import {DataView} from '../constants';
import {storageBackend} from '../storage';

import ConfirmDeleteButton from './ConfirmDeleteButton';
import EditLink from './EditLink';
import {refreshCurrentDataView} from './loadDataForView';

import dataStyles from './data-styles.module.scss';

class EditTableListRow extends React.Component {
  static propTypes = {
    onViewChange: PropTypes.func.isRequired,
    tableName: PropTypes.string.isRequired,
    tableType: PropTypes.string,
  };

  handleEdit = () => {
    this.props.onViewChange(DataView.TABLE, this.props.tableName);
  };

  handleDelete = () =>
    storageBackend().deleteTable(this.props.tableName, refreshCurrentDataView);

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
