import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import {
  changeView,
  updateTableColumns,
  updateTableRecords
} from '../redux/data';
import {DataView} from '../constants';
import ConfirmDeleteButton from '../dataBrowser/ConfirmDeleteButton';
import ConfirmImportButton from '../dataBrowser/ConfirmImportButton';
import DataTable from '../dataBrowser/DataTable';

class Dataset extends React.Component {
  static propTypes = {
    isLive: PropTypes.bool.isRequired,
    // Provided via Redux
    tableName: PropTypes.string.isRequired,
    onUploadComplete: PropTypes.func.isRequired
  };

  state = {
    notice: null,
    isError: false
  };

  importCsv = (csv, onComplete) => {
    $.ajax({
      url: `/datasets/${this.props.tableName}`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({csv_data: csv})
    })
      .done(data => {
        this.props.onUploadComplete(
          this.props.tableName,
          Object.values(data.records),
          data.columns
        );
        this.setState({notice: 'Upload succeeded.', isError: false});
        onComplete();
      })
      .fail((jqXHR, textStatus) => {
        this.setState({
          notice: `Upload failed - ${textStatus}`,
          isError: true
        });
      });
  };

  deleteTable = () => {
    $.ajax({
      url: `/datasets/${this.props.tableName}`,
      method: 'DELETE'
    })
      .done(data => {
        window.location.href = '/datasets';
      })
      .fail(() => this.setState({notice: 'Delete failed', isError: true}));
  };

  render() {
    return (
      <div>
        {this.state.notice && (
          <p style={this.state.isError ? styles.error : styles.success}>
            {this.state.notice}
          </p>
        )}
        <h1>{`${this.props.tableName}${
          this.props.isLive ? ' (Live)' : ''
        }`}</h1>
        <p>
          <a href="/datasets">Back to Index</a>
        </p>
        {!this.props.isLive && (
          <div>
            <ConfirmDeleteButton
              body={`Are you sure you want to delete ${
                this.props.tableName
              }? This action cannot be undone.`}
              buttonText="Delete table"
              containerStyle={{width: 125, marginLeft: 10}}
              buttonId="clearTableButton"
              onConfirmDelete={this.deleteTable}
              title={`Delete ${this.props.tableName}`}
            />
            <ConfirmImportButton importCsv={this.importCsv} />
          </div>
        )}
        <DataTable readOnly rowsPerPage={10} />
      </div>
    );
  }
}

const styles = {
  error: {
    color: color.red,
    backgroundColor: color.lightest_red,
    padding: 10,
    fontSize: 14
  },
  success: {
    color: color.realgreen,
    backgroundColor: color.lighter_green,
    padding: 10,
    fontSize: 14
  }
};

export default connect(
  state => ({
    tableName: state.data.tableName || ''
  }),
  dispatch => ({
    onUploadComplete(tableName, records, columns) {
      dispatch(changeView(DataView.TABLE, tableName));
      dispatch(updateTableRecords(tableName, records));
      dispatch(updateTableColumns(tableName, columns));
    }
  })
)(Dataset);
