import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import DataTable from '../dataBrowser/DataTable';
import {setLbData} from '@cdo/apps/storage/redux/data';
import ConfirmImportButton from '../dataBrowser/ConfirmImportButton';

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

  displayNotice = (notice, isError) => {
    this.setState({notice, isError}, () =>
      setTimeout(() => this.setState({notice: null, isError: false}), 5000)
    );
    window.scrollTo(0, 0);
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
          Object.values(data.records),
          data.columns
        );
        this.displayNotice('Upload succeeeded.', false);
        onComplete();
      })
      .fail((x, y) => {
        console.log(x);
        this.displayNotice('Upload failed', true);
      });
  };

  render() {
    console.log(this.props.tableName);
    console.log(this.props.tableColumns);
    return (
      <div>
        {this.state.notice && (
          <p style={this.state.isError ? styles.error : styles.success}>
            {this.state.notice}
          </p>
        )}
        <h1>{this.props.tableName}</h1>
        <p>
          <a href="/datasets/index">Back to Index</a>
        </p>
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
