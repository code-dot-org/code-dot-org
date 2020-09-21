import PropTypes from "prop-types";
import React, { Component } from "react";
import Papa from "papaparse";
import { connect } from "react-redux";
import { setImportedData } from "../redux";

class CSVReaderWrapper extends Component {
  static propTypes = {
    setImportedData: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      csvfile: undefined,
      data: undefined
    };
  }

  handleChange = event => {
    this.setState({
      csvfile: event.target.files[0]
    });
  };

  importCSV = () => {
    const { csvfile } = this.state;
    Papa.parse(csvfile, {
      complete: this.updateData,
      header: true
    });
  };

  updateData = result => {
    var data = result.data;
    this.props.setImportedData(data);
  };

  render() {
    return (
      <div>
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
    setImportedData(data) {
      dispatch(setImportedData(data));
    }
  })
)(CSVReaderWrapper);
