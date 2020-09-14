import React, { Component } from "react";
import Button from "./components/Button";

export default class App extends Component {
  onClickImportDataset = () => {
    alert("You clicked the button!");
  };

  render() {
    return (
      <div>
        <h1>This is a React component!</h1>
        <h3>Sit tight, there's more ML stuff coming soon.</h3>
        <Button text="import dataset" onClick={this.onClickImportDataset} />
      </div>
    );
  }
}
