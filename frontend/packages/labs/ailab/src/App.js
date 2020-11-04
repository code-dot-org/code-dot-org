import React, { Component } from "react";
import SelectDataset from "./UIComponents/SelectDataset";
import DataDisplay from "./UIComponents/DataDisplay";
import SelectFeatures from "./UIComponents/SelectFeatures";
import ColumnInspector from "./UIComponents/ColumnInspector";
import SelectTrainer from "./UIComponents/SelectTrainer";
import TrainModel from "./UIComponents/TrainModel";
import Predict from "./UIComponents/Predict";

export default class App extends Component {
  render() {
    return (
      <div>
        <SelectDataset />
        <DataDisplay />
        <SelectFeatures />
        <ColumnInspector />
        <SelectTrainer />
        <TrainModel />
        <Predict />
      </div>
    );
  }
}
