import React, { Component } from "react";
import Papa from "papaparse";

export default class CSVReaderWrapper extends Component {
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
    this.setState({
      data: JSON.stringify(data)
    });
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
          {" "}
          Upload now!
        </button>
        {this.state.data && (
          <div>
            <h2>Here's the data</h2>
            <span>{this.state.data}</span>
          </div>
        )}
      </div>
    );
  }
}
