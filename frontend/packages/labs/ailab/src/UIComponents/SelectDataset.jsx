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
  getSpecifiedDatasets,
  setSelectedTrainer
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
    setSelectedTrainer: PropTypes.func.isRequired,
    csvfile: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    jsonfile: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    resetState: PropTypes.func.isRequired,
    specifiedDatasets: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string
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

    // We reset state, but we want to keep hiding the trainer selection.
    this.props.setSelectedTrainer("knnClassify");

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

    const assetPath = global.__ml_playground_asset_public_path__;

    return (
      <div id="select-dataset" style={styles.panel}>
        <div style={styles.largeText}>Which dataset would you like to use?</div>
        <div style={styles.scrollableContentsTinted}>
          <div style={styles.scrollingContents}>
            <div>Select a dataset from the collection</div>

            <div style={styles.datasets}>
              {datasets.map(dataset => {
                return (
                  <div
                    style={{
                      ...styles.selectDatasetItem,
                      ...(this.props.name === dataset.name &&
                        styles.selectDatasetItemSelected)
                    }}
                    key={dataset.id}
                    onClick={() => this.handleDatasetClick(dataset.id)}
                  >
                    <img
                      src={assetPath + dataset.imagePath}
                      style={styles.selectDatasetImage}
                    />
                    <div>{dataset.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {!specifiedDatasets && (
          <div style={{ ...styles.contents, marginTop: 20 }}>
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
    specifiedDatasets: getSpecifiedDatasets(state),
    name: state.name
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
    },
    setSelectedTrainer(selectedTrainer) {
      dispatch(setSelectedTrainer(selectedTrainer));
    }
  })
)(SelectDataset);
