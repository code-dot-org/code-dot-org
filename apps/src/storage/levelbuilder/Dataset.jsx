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
import ConfirmImportButton from '../dataBrowser/ConfirmImportButton';
import DataTable from '../dataBrowser/DataTable';

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

class Dataset extends React.Component {
  static propTypes = {
    isLive: PropTypes.bool.isRequired,
    // Provided via Redux
    tableColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    tableName: PropTypes.string.isRequired,
    // "if all of the keys are integers, and more than half of the keys between 0 and
    // the maximum key in the object have non-empty values, then Firebase will render
    // it as an array."
    // https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
    tableRecords: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
      .isRequired,
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
      .fail(() => this.setState({notice: 'Upload failed.', isError: true}));
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
          <ConfirmImportButton importCsv={this.importCsv} />
        )}
        <DataTable readOnly rowsPerPage={10} />
      </div>
    );
  }
}

export default connect(
  state => ({
    tableColumns: state.data.tableColumns || [],
    tableRecords: state.data.tableRecords || {},
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
