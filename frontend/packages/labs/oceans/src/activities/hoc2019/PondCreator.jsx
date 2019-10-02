import React, {PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import {fish} from '../../utils/sketches';
import SimpleTrainer from '../../utils/SimpleTrainer';
const P5 = require('../../utils/loadP5');

const FISH_COUNT = 9;

export default class PondCreator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      trainer: new SimpleTrainer(),
      fish: this.generateFish()
    };
  }

  generateFish = () => {
    let fishData = {};
    for (let i = 0; i < FISH_COUNT; i++) {
      const canvasId = `fish-canvas-${i}`;
      const p5 = new P5(fish, canvasId);
      fishData[canvasId] = p5;
    }

    return fishData;
  };

  addExample = () => {};

  render() {
    const {fish} = this.state;

    if (!fish) {
      return null;
    }

    return (
      <div>
        {Object.keys(fish).map(canvasId => (
          <Row key={canvasId}>
            <Col id={canvasId} xs={6} />
            <Col xs={4}>KNN data: {fish[canvasId].getKnnData().join(', ')}</Col>
            <Col xs={2}>
              <Button onClick={this.addExample}>Add example</Button>
            </Col>
          </Row>
        ))}
      </div>
    );
  }
}
