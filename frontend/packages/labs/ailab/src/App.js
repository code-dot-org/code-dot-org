import React, { Component } from "react";
import CSVReaderWrapper from "./CSVReaderWrapper";

export default class App extends Component {
  onClickImportDataset = () => {
    alert("You clicked the button!");
  };

  render() {
    return (
      <div>
        <CSVReaderWrapper />
      </div>
    );
  }
}
