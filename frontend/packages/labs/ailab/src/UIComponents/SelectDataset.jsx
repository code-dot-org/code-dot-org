/* React component to handle importing CSVs and pushing data to Redux store. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import Papa from "papaparse";
import { connect } from "react-redux";
import { setSelectedCSV, resetState } from "../redux";
import { parseCSV } from "../csvReaderWrapper";
import { allDatasets } from "../datasetManifest";

class SelectDataset extends Component {
  static propTypes = {
    setSelectedCSV: PropTypes.func.isRequired,
    csvfile: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    resetState: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      download: false
    };
  }

  handleChange = event => {
    this.props.resetState();
    this.props.setSelectedCSV(event.target.files[0]);
    this.setState({
      download: false
    });
  };

  handleChangeSelect = event => {
    this.props.resetState();
    this.props.setSelectedCSV(event.target.value);
    this.setState({
      download: true
    });
  };

  importCSV = () => {
    parseCSV(this.props.csvfile, this.state.download);
  };

  render() {
    const assetPath = global.__ml_playground_asset_public_path__;

    return (
      <div>
        <h2>Which dataset would you like to use?</h2>
        <form>
          <label>
            <h2>Select a dataset from the collection</h2>
            <select onChange={this.handleChangeSelect}>
              <option>{""}</option>
              {allDatasets.map(dataset => {
                return (
                  <option
                    key={dataset["id"]}
                    value={assetPath + dataset["path"]}
                  >
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
  state => ({
    csvfile: state.csvfile
  }),
  dispatch => ({
    resetState() {
      dispatch(resetState());
    },
    setSelectedCSV(csvfilePath) {
      dispatch(setSelectedCSV(csvfilePath));
    },
    setImportedData(data) {
      dispatch(setImportedData(data));
    },
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    }
  })
)(SelectDataset);
