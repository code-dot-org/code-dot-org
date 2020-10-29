import React, { Component } from "react";
import CSVReaderWrapper from "./UIComponents/CSVReaderWrapper";
import DataDisplay from "./UIComponents/DataDisplay";
import SelectFeatures from "./UIComponents/SelectFeatures";
import SelectTrainer from "./UIComponents/SelectTrainer";
import TrainModel from "./UIComponents/TrainModel";
import Predict from "./UIComponents/Predict";

export default class App extends Component {
  render() {
    return (
      <div>
        <CSVReaderWrapper />
        <DataDisplay />
        <SelectFeatures />
        <SelectTrainer />
        <TrainModel />
        <Predict />
      </div>
    );
  }
}
