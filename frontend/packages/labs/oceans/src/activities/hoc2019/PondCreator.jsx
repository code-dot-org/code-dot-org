import React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import {sketch} from '../../utils/sketches';
import SimpleTrainer from '../../utils/SimpleTrainer';
const P5 = require('../../utils/loadP5');

const FISH_COUNT = 9;

export const ClassType = Object.freeze({
  Like: 1,
  Dislike: 2
});

export default class PondCreator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      trainer: new SimpleTrainer(),
      fish: this.generateFish()
    };
  }

  componentDidMount() {
    this.state.trainer.initializeClassifiers();
  }

  generateFish = () => {
    let fishData = {};
    for (let i = 0; i < FISH_COUNT; i++) {
      const canvasId = `fish-canvas-${i}`;
      const p5 = new P5(sketch, canvasId);
      fishData[canvasId] = p5;
    }

    return fishData;
  };

  addExample = (canvasId, doesLike) => {
    const knnData = this.state.fish[canvasId].getKnnData();
    const classifier = doesLike ? ClassType.Like : ClassType.Dislike;
    this.state.trainer.addExampleData(knnData, classifier);
  };

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
              <Button onClick={() => this.addExample(canvasId, true)}>
                Like
              </Button>
              <Button onClick={() => this.addExample(canvasId, false)}>
                Dislike
              </Button>
            </Col>
          </Row>
        ))}
      </div>
    );
  }
}
