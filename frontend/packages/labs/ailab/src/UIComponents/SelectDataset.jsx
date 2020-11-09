/* React component to handle importing CSVs and pushing data to Redux store. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setSelectedCSV, resetState } from "../redux";
import { parseCSV } from "../csvReaderWrapper";
import { allDatasets } from "../datasetManifest";
import { styles } from "../constants";

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
      <div id="select-dataset" style={styles.panel}>
        <div style={styles.largeText}>Which dataset would you like to use?</div>
        <form>
          <div style={styles.subPanel}>
            <div>
              Select a dataset from the collection
            </div>
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
          </div>
        </form>
        <div style={styles.subPanel}>
          <div>or import a CSV File</div>
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
        </div>
        <p />
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
    }
  })
)(SelectDataset);
