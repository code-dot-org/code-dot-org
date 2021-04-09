/* React component to handle importing CSVs and pushing data to Redux store. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setSelectedName,
  setSelectedCSV,
  setSelectedJSON,
  resetState,
  getSpecifiedDatasets,
  setHighlightDataset
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
    setHighlightDataset: PropTypes.func.isRequired,
    csvfile: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    jsonfile: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    resetState: PropTypes.func.isRequired,
    specifiedDatasets: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    highlightDataset: PropTypes.string
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

    const assetPath = global.__ml_playground_asset_public_path__;

    return (
      <div id="select-dataset" style={styles.panel}>
        <div style={styles.scrollableContentsTinted}>
          <div style={styles.scrollingContents}>
            {datasets.map(dataset => {
              return (
                <div
                  style={{
                    ...styles.selectDatasetItem,
                    ...(this.props.highlightDataset === dataset.name &&
                      styles.selectDatasetItemHighlighted),
                    ...(this.props.name === dataset.name &&
                      styles.selectDatasetItemSelected)
                  }}
                  key={dataset.id}
                  onClick={() => this.handleDatasetClick(dataset.id)}
                  onMouseEnter={() =>
                    this.props.setHighlightDataset(dataset.name)
                  }
                  onMouseLeave={() => this.props.setHighlightDataset(undefined)}
                >
                  <img
                    src={assetPath + dataset.imagePath}
                    style={styles.selectDatasetImage}
                    draggable={false}
                  />
                  <div style={styles.selectDatasetText}>{dataset.name}</div>
                </div>
              );
            })}
          </div>
        </div>
        {!specifiedDatasets && (
          <div style={{ ...styles.contents, marginTop: 20 }}>
            <div style={{ float: "left", width: "33.33%" }}>
              <div style={{ fontSize: 13.33, paddingTop: 4 }}>
                Or import a CSV file
              </div>
            </div>
            <div
              style={{ float: "left", width: "33.33%", textAlign: "center" }}
            >
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
            </div>
            <div style={{ float: "left", width: "33.33%", textAlign: "right" }}>
              <button type="button" onClick={this.handleUpload}>
                Upload
              </button>
            </div>
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
    name: state.name,
    highlightDataset: state.highlightDataset
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
    setHighlightDataset(id) {
      dispatch(setHighlightDataset(id));
    }
  })
)(SelectDataset);
