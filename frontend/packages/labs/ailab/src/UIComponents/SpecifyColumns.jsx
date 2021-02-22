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
import { ColumnTypes, styles } from "../constants";

class SpecifyColumns extends Component {
  static propTypes = {
    data: PropTypes.array,
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
    name: PropTypes.string,
    columnsByDataType: PropTypes.object
  };

  handleChangeDataType = (event, feature) => {
    event.preventDefault();
    this.props.setColumnsByDataType(feature, event.target.value);
  };

  render() {
    const { data, columnsByDataType } = this.props;

    return (
      <div id="select-dataset" style={styles.panel}>
        <div style={styles.largeText}>Review and adjust the column types</div>
        <div style={{ ...styles.subPanel, ...styles.scrollContents }}>
          {Object.keys(data[0]).map(key => {
            return (
              <div key={key} style={{
                    marginBottom: 10}}>
                <div
                  style={{
                    ...styles.bold,
                    display: "inline-block",
                    width: "20%"
                  }}
                >
                  {key}
                </div>

                <select
                  onChange={event => this.handleChangeDataType(event, key)}
                  value={columnsByDataType[key]}
                >
                  {Object.values(ColumnTypes).map((option, index) => {
                    return (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    data: state.data,
    csvfile: state.csvfile,
    jsonfile: state.jsonfile,
    specifiedDatasets: getSpecifiedDatasets(state),
    name: state.name,
    columnsByDataType: state.columnsByDataType
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
)(SpecifyColumns);
