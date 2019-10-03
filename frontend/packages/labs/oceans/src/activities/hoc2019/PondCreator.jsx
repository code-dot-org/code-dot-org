import React from 'react';
import Row from 'react-bootstrap/lib/Row';
import {sketch} from '../../utils/sketches';
import SimpleTrainer from '../../utils/SimpleTrainer';
//const P5 = require('../../utils/loadP5');
import P5Canvas from './P5Canvas';

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
      //const p5 = new P5(sketch, canvasId);
      fishData[canvasId] = 'hi';
    }

    return fishData;
  };

  addExample = (knnData, doesLike) => {
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
            <P5Canvas
              id={canvasId}
              fish_data={{}}
              canvasId={canvasId}
              sketch={sketch}
              addExample={this.addExample}
            />
          </Row>
        ))}
      </div>
    );
  }
}
