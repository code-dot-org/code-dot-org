import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import DataTable from '../dataBrowser/DataTable';
import {setLbData} from '@cdo/apps/storage/redux/data';
import ConfirmImportButton from '../dataBrowser/ConfirmImportButton';

class Dataset extends React.Component {
  static propTypes = {
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

  importCsv = (csv, onComplete) => {
    $.ajax({
      url: `/datasets/${this.props.tableName}/edit`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({csv_data: csv})
    })
      .done(data => {
        this.props.onUploadComplete(
          this.props.tableName,
          data.records,
          data.columns
        );
        onComplete();
      })
      .fail((x, y) => {
        console.log(x);
      });
  };

  render() {
    console.log(this.props.tableName);
    console.log(this.props.tableColumns);
    console.log(this.props.tableRecords);
    return (
      <div>
        <p>{this.props.tableName}</p>
        <ConfirmImportButton importCsv={this.importCsv} />
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
      dispatch(setLbData(tableName, records, columns));
    }
  })
)(Dataset);
