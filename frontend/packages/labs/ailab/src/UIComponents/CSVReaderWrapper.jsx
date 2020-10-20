/* React component to handle importing CSVs and pushing data to Redux store. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import Papa from "papaparse";
import { connect } from "react-redux";
import {
  resetState,
  setImportedData,
  setColumnsByDataType,
  ColumnTypes
} from "../redux";
import { availableDatasets } from "../datasetManifest";

class CSVReaderWrapper extends Component {
  static propTypes = {
    resetState: PropTypes.func.isRequired,
    setImportedData: PropTypes.func.isRequired,
    setColumnsByDataType: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      csvfile: undefined,
      download: false,
      data: undefined
    };
  }

  handleChange = event => {
    this.props.resetState();
    this.setState({
      csvfile: event.target.files[0],
      download: false
    });
  };

  handleChangeSelect = event => {
    this.props.resetState();
    this.setState({
      csvfile: event.target.value,
      download: true
    });
  };

  importCSV = () => {
    const { csvfile, download } = this.state;
    Papa.parse(csvfile, {
      complete: this.updateData,
      header: true,
      download: download
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
        <h2>Which dataset would you like to use?</h2>
        <form>
          <label>
            <h2>Select a dataset from the collection</h2>
            <select onChange={this.handleChangeSelect}>
              <option>{""}</option>
              {availableDatasets.map(dataset => {
                return (
                  <option key={dataset["id"]} value={dataset["path"]}>
                    {dataset["name"]}
                  </option>
                );
              })}
            </select>
          </label>
        </form>
        <h2>OR</h2>
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
        <h2>Upload the selected dataset</h2>
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
    resetState() {
      dispatch(resetState());
    },
    setImportedData(data) {
      dispatch(setImportedData(data));
    },
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    }
  })
)(CSVReaderWrapper);
