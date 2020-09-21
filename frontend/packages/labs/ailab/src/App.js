import React, { Component } from "react";
import CSVReaderWrapper from "./UIComponents/CSVReaderWrapper";
import DataDisplay from "./UIComponents/DataDisplay";
import TrainModel from "./UIComponents/TrainModel";

export default class App extends Component {
  render() {
    return (
      <div>
        <CSVReaderWrapper />
        <DataDisplay />
        <TrainModel />
      </div>
    );
  }
}
