import React, { Component } from "react";
import Papa from "papaparse";
const svmjs = require("svm");

export default class CSVReaderWrapper extends Component {
  constructor(props) {
    super(props);
    this.initTrainingState();

    this.state = {
      csvfile: undefined,
      data: undefined,
      labelColumn: "delicious?",
      labels: undefined,
      featureColumns: [
        "chocolate",
        "fruity",
        "caramel",
        "peanutyalmondy",
        "nougat",
        "crispedricewafer",
        "hard",
        "bar",
        "pluribus"
      ],
      features: [],
      prediction: undefined
    };
  }

  initTrainingState() {
    this.svm = new svmjs.SVM();
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

  extractLabels = row => {
    return parseInt(row[this.state.labelColumn]);
  };

  extractFeatures = row => {
    let featureValues = [];
    this.state.featureColumns.forEach(featureColumn =>
      featureValues.push(parseInt(row[featureColumn]))
    );
    return featureValues;
  };

  updateData = result => {
    var data = result.data;

    const labels = data.map(this.extractLabels);
    const features = data.map(this.extractFeatures);

    this.setState({
      data: data,
      labels: labels,
      features: features
    });
  };

  train = () => {
    this.svm.train(this.state.features, this.state.labels);
  };

  predict = () => {
    const predictedLabel = this.svm.predict([[1, 0, 1, 0, 0, 1, 0, 1, 0]]);
    const prediction = predictedLabel > 0 ? "delicious!" : "yuck!";
    this.setState({
      prediction: prediction
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
          Upload now!
        </button>
        {this.state.data && (
          <div>
            <h2>Raw Data</h2>
            <span>{JSON.stringify(this.state.data)}</span>
            <h2>Labels based on {JSON.stringify(this.state.labelColumn)}</h2>
            <span>{JSON.stringify(this.state.labels)}</span>
            <h2>
              Features based on {JSON.stringify(this.state.featureColumns)}
            </h2>
            <span>{JSON.stringify(this.state.features)}</span>
            <br />
            <br />
            <button type="button" onClick={this.train}>
              Train SVM model
            </button>
            <br />
            <br />
            <button type="button" onClick={this.predict}>
              Predict!
            </button>
            {this.state.prediction && (
              <div>
                <h2> The machine learning model predicts.... </h2>
                <span>{JSON.stringify(this.state.prediction)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
