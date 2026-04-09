/* React component to handle importing CSVs and pushing data to Redux store. */
import PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import {
  setSelectedName,
  setSelectedCSV,
  setSelectedJSON,
  resetState,
  getSpecifiedDatasets,
  setHighlightDataset
} from "../redux";
import { parseCSV, MIN_CSV_ROWS, MIN_CSV_COLUMNS } from "../csvReaderWrapper";
import { parseJSON } from "../jsonReaderWrapper";
import { getDatasets, getAvailableDatasets } from "../datasetManifest";
import { styles } from "../constants";
import ScrollableContent from "./ScrollableContent";
import I18n from "../i18n";

function SelectDataset({
  setSelectedName,
  setSelectedCSV,
  setSelectedJSON,
  setHighlightDataset,
  resetState,
  specifiedDatasets,
  name,
  highlightDataset,
  invalidData
}) {
  const [, setDownload] = useState(false);

  const handleDatasetClick = id => {
    const assetPath = global.__ml_playground_asset_public_path__;
    const dataset = getDatasets().find(dataset => dataset.id === id);

    // Don't process the click if we're just clicking the current
    // dataset again.
    if (dataset.name !== name) {
      const csvPath = assetPath + dataset.path;
      const jsonPath = assetPath + dataset.metadataPath;

      resetState();
      setSelectedName(dataset.name);
      setSelectedCSV(csvPath);
      setSelectedJSON(jsonPath);
      setDownload(true);

      parseCSV(csvPath, true, false);

      parseJSON(jsonPath);
    }
  };

  const handleUploadSelect = event => {
    resetState();
    setSelectedCSV(event.target.files[0]);
    setDownload(false);
    parseCSV(event.target.files[0], false, true);
  };

  const getInvalidDataMessage = () => {
    if (invalidData === "tooFewRows") {
      return I18n.t(
        "selectDatasetErrorTooFewRows",
        {"count": MIN_CSV_ROWS, "fileType": "CSV"});
    } else if (invalidData === "tooFewColumns") {
      return I18n.t(
        "selectDatasetErrorTooFewColumns",
        {"count": MIN_CSV_COLUMNS, "fileType": "CSV"});
    } else {
      return null;
    }
  };

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
                ...(highlightDataset === dataset.name &&
                  styles.selectDatasetItemHighlighted),
                ...(name === dataset.name &&
                  styles.selectDatasetItemSelected),
                ...(index % 3 === 0 && { clear: "both" })
              }}
              key={dataset.id}
              onClick={() => handleDatasetClick(dataset.id)}
              onKeyDown={() => handleDatasetClick(dataset.id)}
              onMouseEnter={() =>
                setHighlightDataset(dataset.name)
              }
              onMouseLeave={() => setHighlightDataset(undefined)}
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
            {I18n.t("selectDatasetUploadFileButton", {"fileType": "CSV"})}
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
              onChange={handleUploadSelect}
              style={styles.csvInput}
              value=""
            />
          </label>
          <span style={styles.invalidDataMessageContainer}>
            {getInvalidDataMessage()}
          </span>
        </div>
      )}
    </div>
  );
}

SelectDataset.propTypes = {
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
