/* React component to handle importing CSVs and pushing data to Redux store. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setSelectedName,
  setSelectedCSV,
  setSelectedJSON,
  resetState,
  setColumnsByDataType,
  setLabelColumn,
  getSpecifiedDatasets
} from "../redux";
import { parseCSV } from "../csvReaderWrapper";
import { parseJSON } from "../jsonReaderWrapper";
import { allDatasets, getAvailableDatasets } from "../datasetManifest";
import { styles } from "../constants";

class SelectDataset extends Component {
  static propTypes = {
    setSelectedName: PropTypes.func.isRequired,
    setSelectedCSV: PropTypes.func.isRequired,
    setSelectedJSON: PropTypes.func.isRequired,
    setColumnsByDataType: PropTypes.func.isRequired,
    setLabelColumn: PropTypes.func.isRequired,
    csvfile: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    jsonfile: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    resetState: PropTypes.func.isRequired,
    specifiedDatasets: PropTypes.arrayOf(PropTypes.string)
  };

  constructor(props) {
    super(props);

    this.state = {
      download: false
    };
  }

  handleDatasetClick = id => {
    const assetPath = global.__ml_playground_asset_public_path__;
    const dataset = allDatasets.find(dataset => dataset.id === id);
    const csvPath = assetPath + dataset.path;
    const jsonPath = assetPath + dataset.metadataPath;

    this.props.resetState();
    this.props.setSelectedName(dataset.name);
    this.props.setSelectedCSV(csvPath);
    this.props.setSelectedJSON(jsonPath);
    this.setState({
      download: true
    });

    parseCSV(csvPath, true, false);

    parseJSON(jsonPath);
  };

  handleDatasetSelect = event => {
    const assetPath = global.__ml_playground_asset_public_path__;
    const dataset = allDatasets.find(
      dataset => dataset.id === event.target.value
    );
    const csvPath = assetPath + dataset.path;
    const jsonPath = assetPath + dataset.metadataPath;

    this.props.resetState();
    this.props.setSelectedCSV(csvPath);
    this.props.setSelectedJSON(jsonPath);
    this.setState({
      download: true
    });

    parseCSV(csvPath, true, false);

    parseJSON(jsonPath);
  };

  handleUploadSelect = event => {
    this.props.resetState();
    this.props.setSelectedCSV(event.target.files[0]);
    this.setState({
      download: false
    });
  };

  handleUpload = () => {
    parseCSV(this.props.csvfile, this.state.download, true);
  };

  render() {
    const specifiedDatasets = this.props.specifiedDatasets;
    const datasets = getAvailableDatasets(specifiedDatasets);

    return (
      <div id="select-dataset" style={styles.panel}>
        <div style={styles.largeText}>Which dataset would you like to use?</div>
        <form>
          <div style={styles.subPanel}>
            <div>Select a dataset from the collection</div>

            <div style={styles.datasets}>
              {datasets.map(dataset => {
                return (
                  <div
                    style={{ width: "100%", padding: 20, clear: "both" }}
                    key={dataset.id}
                    onClick={() => this.handleDatasetClick(dataset.id)}
                  >
                    <img
                      src={dataset.imagePath}
                      style={{ width: 240, float: "left" }}
                    />
                    <div style={{ float: "left", paddingLeft: 20 }}>{dataset.name}</div>
                  </div>
                );
              })}
            </div>

            {/*<select onChange={this.handleDatasetSelect}>
              <option>{""}</option>
              {datasets.map(dataset => {
                return (
                  <option key={dataset["id"]} value={dataset["id"]}>
                    {dataset["name"]}
                  </option>
                );
              })}
            </select>*/}
          </div>
        </form>
        {!specifiedDatasets && (
          <div style={styles.subPanel}>
            <div>or import a CSV File</div>
            <input
              className="csv-input"
              type="file"
              accept=".csv,.xls,.xlsx"
              ref={input => {
                this.filesInput = input;
              }}
              name="file"
              placeholder={null}
              onChange={this.handleUploadSelect}
            />
            <p />
            <button type="button" onClick={this.handleUpload}>
              Upload now!
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    csvfile: state.csvfile,
    jsonfile: state.jsonfile,
    specifiedDatasets: getSpecifiedDatasets(state)
  }),
  dispatch => ({
    resetState() {
      dispatch(resetState());
    },
    setSelectedName(name) {
      dispatch(setSelectedName(name));
    },
    setSelectedCSV(csvfilePath) {
      dispatch(setSelectedCSV(csvfilePath));
    },
    setSelectedJSON(jsonfilePath) {
      dispatch(setSelectedJSON(jsonfilePath));
    },
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    },
    setLabelColumn(labelColumn) {
      dispatch(setLabelColumn(labelColumn));
    }
  })
)(SelectDataset);
