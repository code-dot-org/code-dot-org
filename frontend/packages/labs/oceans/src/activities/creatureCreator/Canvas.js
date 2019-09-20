import React, { Component } from "react";
import sketch from "./sketches/faces";

export default class Canvas extends Component {
  constructor() {
    super();
    this.state = {
      notes: ""
    };
  }

  componentDidMount() {
    this.canvas = new window.p5(sketch, "app-p5_container");
  }

  randomColor() {
    if (this.canvas) {
      var color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
      this.canvas.setColor(color);
      this.setState({
        notes: "color: " + color.toString()
      });
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.randomColor.bind(this)}>Random Color</button>
        <div id="p5-canvas" />
        <p>{this.state.notes}</p>
      </div>
    );
  }
}
