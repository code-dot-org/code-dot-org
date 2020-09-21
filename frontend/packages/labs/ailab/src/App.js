import React, { Component } from "react";
import CSVReaderWrapper from "./CSVReaderWrapper";
import DataDisplay from "./DataDisplay";

export default class App extends Component {
  render() {
    return (
      <div>
        <CSVReaderWrapper />
        <DataDisplay />
      </div>
    );
  }
}
