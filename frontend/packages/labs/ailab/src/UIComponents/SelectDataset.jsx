/* React component to handle importing CSVs and pushing data to Redux store. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setSelectedCSV, setSelectedJSON, resetState, setColumnsByDataType, setLabelColumn } from "../redux";
import { parseCSV } from "../csvReaderWrapper";
import { parseJSON } from "../jsonReaderWrapper";
import { allDatasets, getAvailableDatasets } from "../datasetManifest";
import { styles } from "../constants";

class SelectDataset extends Component {
  static propTypes = {
    setSelectedCSV: PropTypes.func.isRequired,
    setSelectedJSON: PropTypes.func.isRequired,
    setColumnsByDataType: PropTypes.func.isRequired,
    setLabelColumn: PropTypes.func.isRequired,
    csvfile: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    jsonfile: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    resetState: PropTypes.func.isRequired,
    mode: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      download: false
    };
  }


  handleDatasetSelect = event => {
    const assetPath = global.__ml_playground_asset_public_path__;
    const dataset = allDatasets.find(dataset => dataset.id === event.target.value);
    const csvPath = assetPath + dataset.path;
    const jsonPath = assetPath + dataset.metadataPath;

    this.props.resetState();
    this.props.setSelectedCSV(csvPath);
    this.props.setSelectedJSON(jsonPath);
    this.setState({
      download: true
    });

    parseCSV(csvPath, true, false);

    parseJSON(jsonPath, result => {
      if (this.props.mode && this.props.mode.hideSpecifyColunns) {
        for (const field of result.fields) {
          this.props.setColumnsByDataType(field.id, field.type);
        }
      }

      if (this.props.mode && this.props.mode.hideSelectLabel) {
        // Use the manifest's default label instead.
        this.props.setLabelColumn(result.defaultLabelColumn);
      }
    });
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
    const specifiedDatasets = this.props.mode && this.props.mode.datasets;
    const datasets = getAvailableDatasets(specifiedDatasets);

    return (
      <div id="select-dataset" style={styles.panel}>
        <div style={styles.largeText}>Which dataset would you like to use?</div>
        <form>
          <div style={styles.subPanel}>
            <div>
              Select a dataset from the collection
            </div>
            <select onChange={this.handleDatasetSelect}>
              <option>{""}</option>
              {datasets.map(dataset => {
                return (
                  <option
                    key={dataset["id"]}
                    value={dataset["id"]}
                  >
                    {dataset["name"]}
                  </option>
                );
              })}
            </select>
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
    mode: state.mode
  }),
  dispatch => ({
    resetState() {
      dispatch(resetState());
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
