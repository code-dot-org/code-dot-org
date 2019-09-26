import React from "react";
import sketch from "./sketches";
import { generateGoodCreature, generateBadCreature } from "./utils";
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

  setCreature = type => {
    let creature;
    if (type === CreatureType.Good) {
      creature = generateGoodCreature();
    } else if (type === CreatureType.Bad) {
      creature = generateBadCreature();
    } else {
      console.error("Unknown CreatureType!");
      return;
    }

    this.p5.setCreature(creature);
  };

  render() {
    return (
      <div>
        <h4>Click a button to generate a good or bad creature.</h4>
        <Button onClick={() => this.setCreature(CreatureType.Good)}>
          Good
        </Button>
        <Button onClick={() => this.setCreature(CreatureType.Bad)}>Bad</Button>
        <br />
        <br />
        <div id={CANVAS_ID} />
      </div>
    );
  }
}
