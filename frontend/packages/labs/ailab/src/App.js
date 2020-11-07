import React, { Component } from "react";
import PropTypes from "prop-types";
import SelectDataset from "./UIComponents/SelectDataset";
import DataDisplay from "./UIComponents/DataDisplay";
import SelectFeatures from "./UIComponents/SelectFeatures";
import ColumnInspector from "./UIComponents/ColumnInspector";
import SelectTrainer from "./UIComponents/SelectTrainer";
import TrainModel from "./UIComponents/TrainModel";
import Results from "./UIComponents/Results";
import Predict from "./UIComponents/Predict";
import { styles } from "./constants";

export default class App extends Component {
  static propTypes = {
    mode: PropTypes.object
  };

  render() {
    return (
      <div style={styles.container}>
        {(!this.props.mode || this.props.mode.id !== "load_dataset") && (
          <SelectDataset />
        )}
        <DataDisplay />
        <SelectFeatures />
        <ColumnInspector />
        <SelectTrainer />
        <TrainModel />
        <Results />
        <Predict />
      </div>
    );
  }
}
