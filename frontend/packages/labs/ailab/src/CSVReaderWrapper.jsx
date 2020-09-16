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
      showRawData: true,
      labelColumn: "delicious?",
      labels: undefined,
      features: [],
      selectedFeatures: [],
      trainClicked: false,
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

  extractExamples = row => {
    let exampleValues = [];
    this.state.selectedFeatures.forEach(feature =>
      exampleValues.push(parseInt(row[feature]))
    );
    return exampleValues;
  };

  updateData = result => {
    var data = result.data;
    const features = Object.keys(data[0]);

    this.setState({
      data: data,
      features: features
    });
  };

  prepareTrainingDataForML = () => {
    const examples = this.state.data.map(this.extractExamples);
    const labels = this.state.data.map(this.extractLabels);
    this.setState(
      {
        examples: examples,
        labels: labels
      },
      this.train
    );
  };

  train = () => {
    console.log("train was called");
    this.svm.train(this.state.examples, this.state.labels);
    this.setState({
      trainClicked: true
    });
  };

  predict = () => {
    const predictedLabel = this.svm.predict([[1, 0, 1, 0, 0, 1, 0, 1, 0]]);
    const prediction = predictedLabel > 0 ? "delicious!" : "yuck!";
    this.setState({
      prediction: prediction
    });
  };

  handleChangeSelect = event => {
    this.setState({
      labelColumn: event.target.value
    });
  };

  handleChangeMultiSelect = event => {
    this.setState({
      selectedFeatures: Array.from(
        event.target.selectedOptions,
        item => item.value
      )
    });
  };

  toggleRawData = () => {
    this.setState({
      showRawData: !this.state.showRawData
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
            {this.state.showRawData && (
              <div>
                <p onClick={this.toggleRawData}>hide raw data</p>
                <span>{JSON.stringify(this.state.data)}</span>
              </div>
            )}
            {!this.state.showRawData && (
              <p onClick={this.toggleRawData}>show raw data</p>
            )}
            <form>
              <label>
                <h2>Which column contains the labels for your dataset?</h2>
                <select
                  value={this.state.labelColumn}
                  onChange={this.handleChangeSelect}
                >
                  {this.state.features.map((feature, index) => {
                    return (
                      <option key={index} value={feature}>
                        {feature}
                      </option>
                    );
                  })}
                </select>
              </label>
            </form>
            <form>
              <label>
                <h2>Which features are you interested in training on?</h2>
                <select
                  multiple={true}
                  value={this.state.selectedFeatures}
                  onChange={this.handleChangeMultiSelect}
                >
                  {this.state.features.map((feature, index) => {
                    return (
                      <option key={index} value={feature}>
                        {feature}
                      </option>
                    );
                  })}
                </select>
              </label>
            </form>
            <h2>Let's train the model!</h2>
            {this.state.labelColumn && this.state.selectedFeatures && (
              <p>
                The machine learning algorithm is going to look for patterns in
                these features: {this.state.selectedFeatures.join(", ")} that
                might help predict the values of the label:{" "}
                {this.state.labelColumn}.
              </p>
            )}
            <button type="button" onClick={this.prepareTrainingDataForML}>
              Train SVM model
            </button>
            <br />
            <br />
            {this.state.trainClicked && (
              <div>
                <h2>Let's test the model!</h2>
                <form>
                  {this.state.selectedFeatures.map((feature, index) => {
                    return (
                      <span>
                        <label>
                          {feature}:
                          <input type="text" />
                        </label>
                      </span>
                    );
                  })}
                </form>
                <button type="button" onClick={this.predict}>
                  Predict!
                </button>
                {this.state.prediction && (
                  <div>
                    <h2> The Machine Learning model predicts.... </h2>
                    <span>{JSON.stringify(this.state.prediction)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
