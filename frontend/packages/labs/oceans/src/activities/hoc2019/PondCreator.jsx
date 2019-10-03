import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import {sketch} from '../../utils/sketches';
import SimpleTrainer from '../../utils/SimpleTrainer';
import P5Canvas from './P5Canvas';
import {COLORS} from '../../utils/colors';

const FISH_COUNT = 9;

export const ClassType = Object.freeze({
  Like: 0,
  Dislike: 1
});

const Modes = Object.freeze({
  Training: 1,
  Predicting: 2
});

export default class PondCreator extends React.Component {
  constructor(props) {
    super(props);

    const trainer = new SimpleTrainer();
    this.state = {
      trainer: trainer,
      trainingFish: this.generateFish('training', FISH_COUNT),
      currentMode: Modes.Training,
      predictionFish: [], // this.generateFish('prediction',1),
      predictions: []
    };
    trainer.initializeClassifiers();
  }

  generateFish = (canvasPrefix, numFish) => {
    let fishData = {};
    for (let i = 0; i < numFish; i++) {
      const canvasId = `${canvasPrefix}-fish-canvas-${i}`;
      fishData[canvasId] = {body: {color: COLORS[i * 3 + 1]}};
    }

    return fishData;
  };

  addExample = (knnData, doesLike) => {
    const classifier = doesLike ? ClassType.Like : ClassType.Dislike;
    this.state.trainer.addExampleData(knnData, classifier);
  };

  switchToPredictions = () => {
    const pondFish = this.generateFish('prediction', 1);
    this.setState({currentMode: Modes.Predicting, predictionFish: pondFish});
  };

  getPrediction = knnData => {
    return this.state.trainer.predictFromData(knnData);
  };

  render() {
    console.log(this.state.predictionFish);
    return (
      <div>
        {this.state.currentMode === Modes.Training && (
          <div>
            {Object.keys(this.state.trainingFish).map(canvasId => (
              <Row key={canvasId}>
                <P5Canvas
                  id={canvasId}
                  fishData={this.state.trainingFish[canvasId]}
                  canvasId={canvasId}
                  sketch={sketch}
                  addExample={this.addExample}
                  isSelectable={true}
                />
              </Row>
            ))}
            <Button onClick={() => this.switchToPredictions()}>
              Show some fish!
            </Button>
          </div>
        )}
        {this.state.currentMode === Modes.Predicting && (
          <div>
            {Object.keys(this.state.predictionFish).map(canvasId => (
              <Row key={canvasId}>
                <P5Canvas
                  id={canvasId}
                  fishData={this.state.predictionFish[canvasId]}
                  canvasId={canvasId}
                  sketch={sketch}
                  addExample={this.addExample}
                  isSelectable={false}
                  showPrediction={true}
                  getPrediction={this.getPrediction}
                />
              </Row>
            ))}
          </div>
        )}
      </div>
    );
  }
}
