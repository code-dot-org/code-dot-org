import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import SimpleTrainer from '../../utils/SimpleTrainer';
import Training from './Training';
import Predict from './Predict';
import PondResult from './PondResult';
import {generateRandomFish} from './SpritesheetFish';

const FISH_COUNT = 15;
const SESSION_KEY = 'PondCreator';

export const ClassType = Object.freeze({
  Like: 0,
  Dislike: 1
});

const Modes = Object.freeze({
  Training: 1,
  Predicting: 2,
  Results: 3
});

export default class PondCreator extends React.Component {
  constructor(props) {
    super(props);

    const trainer = new SimpleTrainer();
    trainer.initializeClassifiers().then(() => {
      this.loadTraining();
      this.setState({initialized: true});
    });
    this.state = {
      trainer: trainer,
      initialized: false,
      trainingData: this.generateFish(FISH_COUNT),
      currentMode: Modes.Training,
      predictionFish: [], // this.generateFish(1),
      predictions: []
    };
  }

  generateFish = numFish => {
    let fishData = [];
    for (let i = 0; i < numFish; i++) {
      fishData[i] = generateRandomFish();
      fishData[i].canvasId = `fish-canvas-${i}`;
    }

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

  loadTraining() {
    const storedTraining = localStorage.getItem(SESSION_KEY);
    if (storedTraining) {
      this.state.trainer.loadDatasetJSON(storedTraining);
    }
  }

  saveTraining = () => {
    localStorage.setItem(SESSION_KEY, this.state.trainer.getDatasetJSON());
  };

  startOver() {
    this.state.trainer.clearAll();
    localStorage.removeItem(SESSION_KEY);
    this.setMode(Modes.Training);
  }

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
              rows={7}
              cols={2}
              label={'Like'}
              saveTraining={this.saveTraining}
            />
            <Button onClick={() => this.setMode(Modes.Predicting)}>
              Train Bot
            </Button>
          </div>
        )}
        {this.state.currentMode === Modes.Predicting && (
          <div>
            <Predict trainingData={this.state.trainingData} />
            <Button onClick={() => this.setMode(Modes.Training)}>
              Train More
            </Button>
            <Button onClick={() => this.setMode(Modes.Results)}>
              Show my pond
            </Button>
          </div>
        )}
        {this.state.currentMode === Modes.Results && (
          <div>
            <PondResult fishData={this.state.trainingData} />
            <Button onClick={() => this.setMode(Modes.Training)}>
              Train More
            </Button>
          </div>
        )}
        <Button onClick={() => this.clearTraining()}>Start over</Button>
      </div>
    );
  }
}
