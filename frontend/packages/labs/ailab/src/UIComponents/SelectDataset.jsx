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
import ScrollableContent from "./ScrollableContent";

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
    highlightDataset: PropTypes.string,
    invalidData: PropTypes.string
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

    // Don't process the click if we're just clicking the current
    // dataset again.
    if (dataset.name !== this.props.name) {
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
    }
  };

  handleUploadSelect = event => {
    this.props.resetState();
    this.props.setSelectedCSV(event.target.files[0]);
    this.setState({
      download: false
    });
    parseCSV(event.target.files[0], false, true);
  };

  getInvalidDataMessage = () => {
    if (this.props.invalidData === "tooFewRows") {
      return "Please upload a CSV with at least 2 rows.";
    } else if (this.props.invalidData === "tooFewColumns") {
      return "Please upload a CSV with at least 2 columns.";
    } else {
      return null;
    }
  };

  render() {
    const specifiedDatasets = this.props.specifiedDatasets;
    const datasets = getAvailableDatasets(specifiedDatasets);

    const assetPath = global.__ml_playground_asset_public_path__;

    return (
      <div id="select-dataset" style={styles.panel}>
        <ScrollableContent tinted={true}>
          {datasets.map((dataset, index) => {
            return (
              <div
                style={{
                  ...styles.selectDatasetItem,
                  ...(this.props.highlightDataset === dataset.name &&
                    styles.selectDatasetItemHighlighted),
                  ...(this.props.name === dataset.name &&
                    styles.selectDatasetItemSelected),
                  ...(index % 3 === 0 && { clear: "both" })
                }}
                key={dataset.id}
                onClick={() => this.handleDatasetClick(dataset.id)}
                onKeyDown={() => this.handleDatasetClick(dataset.id)}
                onMouseEnter={() =>
                  this.props.setHighlightDataset(dataset.name)
                }
                onMouseLeave={() => this.props.setHighlightDataset(undefined)}
                role="button"
                tabIndex={0}
              >
                <div style={styles.selectDatasetItemContainer}>
                  <img
                    src={assetPath + dataset.imagePath}
                    style={styles.selectDatasetImage}
                    draggable={false}
                    className="uitest-ailab-dataset-image ailab-image-hover"
                    alt={`Select ${dataset.name} dataset`}
                  />
                  <div style={styles.selectDatasetText}>{dataset.name}</div>
                </div>
              </div>
            );
          })}
        </ScrollableContent>
        {!specifiedDatasets && (
          <div style={styles.contentsCsvButton}>
            <label style={styles.uploadCsvButton}>
              Upload CSV
              {/* Setting value to empty here allows us to receive an
                  onChange event for the same file as previously selected,
                  which allows the user to upload a file, then choose an
                  existing dataset, and then reupload the same file. */}
              <input
                className="csv-input"
                type="file"
                accept=".csv,text/csv,application/vnd.ms-excel"
                name="file"
                placeholder={null}
                onChange={this.handleUploadSelect}
                style={styles.csvInput}
                value=""
              />
            </label>
            <span style={styles.invalidDataMessageContainer}>
              {this.getInvalidDataMessage()}
            </span>
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
    highlightDataset: state.highlightDataset,
    invalidData: state.invalidData
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
