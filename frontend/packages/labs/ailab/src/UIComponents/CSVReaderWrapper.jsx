/* React component to handle importing CSVs and pushing data to Redux store. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import Papa from "papaparse";
import { connect } from "react-redux";
import { setImportedData, setColumnsByDataType, ColumnTypes } from "../redux";

class CSVReaderWrapper extends Component {
  static propTypes = {
    setImportedData: PropTypes.func.isRequired,
    setColumnsByDataType: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      csvfile: undefined,
      data: undefined
    };
  }

  handleChange = event => {
    this.setState({
      csvfile: event.target.files[0]
    });
  };

  importCSV = () => {
    const { csvfile } = this.state;
    Papa.parse(csvfile, {
      complete: this.updateData,
      header: true
    });
  };

  updateData = result => {
    var data = result.data;
    this.props.setImportedData(data);
    this.setDefaultColumnDataType(data);
  };

  setDefaultColumnDataType = data => {
    Object.keys(data[0]).map(column =>
      this.props.setColumnsByDataType(column, ColumnTypes.OTHER)
    );
  };

  render() {
    return (
      <div>
        <h2>Import CSV File</h2>
        <input
          className="csv-input"
          type="file"
          ref={input => {
            this.filesInput = input;
          }}
          name="file"
          placeholder={null}
          onChange={this.handleChange}
        />
        <p />
        <button type="button" onClick={this.importCSV}>
          Upload now!
        </button>
      </div>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    setImportedData(data) {
      dispatch(setImportedData(data));
    },
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    }
  })
)(CSVReaderWrapper);
