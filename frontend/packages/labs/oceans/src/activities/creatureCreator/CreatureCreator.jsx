import React from "react";
import sketch from "./sketches";
import Button from "react-bootstrap/lib/Button";
const P5 = require("./loadP5");

const CANVAS_ID = "p5-canvas";

const CreatureType = Object.freeze({
  None: 0,
  Good: 1,
  Bad: 2
});

export default class CreatureCreator extends React.Component {
  componentDidMount() {
    this.p5 = new P5(sketch, CANVAS_ID);
  }

  generateCreature = type => {
    switch (type) {
      case CreatureType.Good:
        this.p5.setGoodCreature();
        break;
      case CreatureType.Bad:
        this.p5.setBadCreature();
        break;
      default:
        console.error("Unknown CreatureType!");
    }
  };

  render() {
    return (
      <div>
        <h4>Click a button to generate a good or bad creature.</h4>
        <Button onClick={() => this.generateCreature(CreatureType.Good)}>
          Good
        </Button>
        <Button onClick={() => this.generateCreature(CreatureType.Bad)}>
          Bad
        </Button>
        <br />
        <br />
        <div id={CANVAS_ID} />
      </div>
    );
  }
}
