import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import SimpleTrainer from '../../utils/SimpleTrainer';
import Training from './Training';
import Predict from './Predict';
import {generateRandomFish} from './SpritesheetFish';

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
    trainer.initializeClassifiers().then(() => {
      this.setState({initialized: true});
    });
    this.state = {
      trainer: trainer,
      initialized: false,
      trainingData: this.generateFish('training', FISH_COUNT),
      currentMode: Modes.Training,
      predictionFish: [], // this.generateFish('prediction',1),
      predictions: []
    };
  }

  generateFish = (canvasPrefix, numFish) => {
    let fishData = [];
    for (let i = 0; i < numFish; i++) {
      fishData[i] = generateRandomFish();
    }

    console.log(fishData);
    return fishData;
  };

  addExample = (knnData, doesLike) => {
    const classifier = doesLike ? ClassType.Like : ClassType.Dislike;
    this.state.trainer.addExampleData(knnData, classifier);
  };

  setMode = newMode => {
    this.setState({currentMode: newMode});
  };

  getPrediction = knnData => {
    return this.state.trainer.predictFromData(knnData);
  };

  getClassTypeString = classType => {
    switch (classType) {
      case ClassType.Like:
        return 'Like! :)';
      case ClassType.Dislike:
        return "Don't like :(";
      default:
        return "I don't know";
    }
  };

  render() {
    if (!this.state.initialized) {
      return null;
    }
    return (
      <div>
        {this.state.currentMode === Modes.Training && (
          <div>
            <Training
              trainer={this.state.trainer}
              trainingData={this.state.trainingData}
              rows={2}
              cols={2}
              label={'Like'}
            />
            <Button onClick={() => this.setMode(Modes.Predicting)}>
              Train Bot
            </Button>
          </div>
        )}
        {this.state.currentMode === Modes.Predicting && (
          <div>
            <Predict />
            <Button onClick={() => this.setMode(Modes.Training)}>
              Train More
            </Button>
          </div>
        )}
      </div>
    );
  }
}
